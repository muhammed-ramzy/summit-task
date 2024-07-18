"use strict";
let customersData, transactionsData;
let customerArr = [], transactionsUniqueArr = [], customersUniqueArr = [], dates, amounts;
let transactionsArr;

let length, chart, label, chosenCustomerId;
let chartInitialized = false;

let customerMap = new Map();

let tableBody = $("#table-body")
let customersDatalist = $("#customer-list")
let transactionDatalist = $("#transaction-list")

// Adding listeners
$(".customer-input").on("input", (eventInfo) => {

    getCustomers($(eventInfo.target).val(), () => { getTransactions("") })
})

$(".transactions-input").on("input", (eventInfo) => {

    getTransactions($(eventInfo.target).val())
})
$(".chart-button").on("click", (e) => {
    let id = $(e.target).attr("id")
    chart.destroy()
    createChart(id)
})

async function getCustomers(term, callBack) {

    let data = await fetch(`http://localhost:3000/customers?name=${term}`)
    let customersData = await data.json();

    label = term;
    if (term != "") {
        chosenCustomerId = customersData[0].id.toString();
    }
    else {
        chosenCustomerId = null;
    }

    customerMap.clear();

    for (let i = 0; i < customersData.length; i++) {
        customerArr.push(customersData[i].name)
        customerMap.set(customersData[i].id.toString(), customersData[i].name)
    }

    customersUniqueArr = [...new Set(customerArr)]
    customersUniqueArr.sort((a, b) => a - b)

    fillCustomerDataList(customersUniqueArr)
    length = customersData.length;
    callBack()
}

async function getTransactions(amount) {

    let data = await fetch(`http://localhost:3000/transactions?amount=${amount}`)
    let transactionsData = await data.json();

    let tempTransactionArr = [];
    transactionsArr = new Array(length).fill(0);


    for (let i = 0; i < transactionsData.length; i++) {
        tempTransactionArr.push(transactionsData[i].amount)
        transactionsArr[transactionsData[i].customer_id - 1] += transactionsData[i].amount;
    }
    transactionsUniqueArr = [...new Set(tempTransactionArr)]
    transactionsUniqueArr.sort((a, b) => a - b)

    fillTransactionDataList(transactionsUniqueArr)



    let blackBox = ``;
    if (!chosenCustomerId) {
        for (let i = 0; i < transactionsData.length; i++) {


            blackBox += `<tr>
            
            <td>${customerMap.get(transactionsData[i].customer_id.toString())}</td>
            <td><span>$</span>${transactionsData[i].amount}</td>
            <td>${transactionsData[i].date}</td>
            </tr>`

        }
    }
    else {
        dates = [];
        amounts = [];

        for (let i = 0; i < transactionsData.length; i++) {
            if (chosenCustomerId == transactionsData[i].customer_id.toString()) {
                dates.push(transactionsData[i].date.toString())
                amounts.push(transactionsData[i].amount)
                console.log(dates);
                console.log(amounts);

                blackBox += `<tr>
                
                <td>${customerMap.get(transactionsData[i].customer_id.toString())}</td>
                <td><span>$</span>${transactionsData[i].amount}</td>
                <td>${transactionsData[i].date}</td>
                </tr>`
            }

        }
    }

    tableBody.html(blackBox)

    // if (!chartInitialized) {
    if (dates == undefined || amounts == undefined || label == "") {
        if (chart) {
            chart.destroy()
            createChart("bar", customerArr, transactionsArr)
            chartInitialized = true;
        }
        else {

            createChart("bar", customerArr, transactionsArr)
            chartInitialized = true;
        }
    }
    else {
        chart.destroy()
        createChart("bar", dates, amounts);
        chartInitialized = true;


    }
    // }
}

getCustomers("", () => { getTransactions("") })


//Chart configuration
function createChart(type, labels, yData) {
    const ctx = document.getElementById('myChart');

    chart = new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: "total transaction amount per day for the selected customer",
                data: yData,
                borderWidth: 3
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            maintainAspectRatio: false
        }
    });

}

function fillCustomerDataList(arr) {
    let customersBlackBox = ``;

    for (let i = 0; i < arr.length; i++) {
        customersBlackBox += `<option value="${arr[i]}">`
    }

    customersDatalist.html(customersBlackBox)

}

function fillTransactionDataList(arr) {
    let transactionblackBox = ``;

    for (let i = 0; i < arr.length; i++) {
        transactionblackBox += `<option value="${arr[i]}">`
    }

    transactionDatalist.html(transactionblackBox)

}
