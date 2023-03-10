const firstCalendar = document.querySelector('.first-date');
const secondCalendar = document.querySelector('.second-date');
const selectedDays = document.querySelector('.select_days');
const selectedMethod = document.querySelector('.select_method');
const btnResult = document.getElementById('btn_result');
const tableResult = document.querySelector('.table-result');
const pressets = document.querySelectorAll('.pressets input');

let firstDate;
let secondDate;
let typeDay = selectedDays.options[selectedDays.selectedIndex].value;
let method = selectedMethod.options[selectedMethod.selectedIndex].value;

// запускаємо функцію showPosts коли весь HTML загружений
document.addEventListener('DOMContentLoaded', showResults);
firstCalendar.addEventListener('change', selectDate);
secondCalendar.addEventListener('change', selectLastDate);
selectedDays.addEventListener('change', changeDay);
selectedMethod.addEventListener('change', changeMethod);
btnResult.addEventListener('click', resultCounter);
pressets.forEach((presset) => presset.addEventListener('click', choiceSecondDate));


function choiceSecondDate(event) {
    let selectedPresset;

    for (const radioButton of pressets) {
        if (radioButton.checked) {
            selectedPresset = radioButton.getAttribute('id');
            break;
        }
    }
    console.log(selectedPresset)

    newSecondDate = new Date(firstDate);

    switch (selectedPresset) {
        case 'week':
            newSecondDate.setDate(newSecondDate.getDate() + 6);
            secondDate = new Date(newSecondDate).toISOString().slice(0, 10);
            console.log(secondDate)
            secondCalendar.value = new Date(secondDate).toISOString().slice(0, 10);
            break;
        case 'month':
            newSecondDate.setMonth(newSecondDate.getMonth() + 1);
            secondDate = new Date(newSecondDate).toISOString().slice(0, 10);
            console.log(secondDate)
            secondCalendar.value = new Date(secondDate).toISOString().slice(0, 10);
            break;
        default:
            return;
    } 
}

function showResults() {
    // оголошуємо змінну яка буде використовуватись для списку завдань
    let results;

    // перевіряємо чи є у localStorage вже якісь завдання
    if (localStorage.getItem('results') !== null) {
        // якщо вони там є - витягуємо їх і присвоюємо змінній
        results = JSON.parse(localStorage.getItem('results'));
    } else {
        // якщо їх там нема - присвоюємо змінній значення порожнього масиву
        results = []
    }

    if (results.length !== 0) {
        results = results.slice(-10);
        const table = document.getElementsByTagName('table')[0];

        if (!tableResult.contains(table)){
            tableResult.innerHTML = 
            `<table class="table table-bordered">
                <thead>
                <tr>
                    <th>Стартова дата</th>
                    <th>Кінцева дата</th>
                    <th>Результат виміру</th>
                </tr>
                </thead>
                <tbody>
                </tbody>
            </table>`;
        }
        
        for(let i = 0; i < 10; i++) {
            const tBody = document.getElementsByTagName('tbody')[0];
            const trVal = 
            `   <td>${results[i].firstDate}</td>
                <td>${results[i].secondDate}</td>
                <td>${results[i].result} ${results[i].method}</td>
            `;
            var tr = document.createElement('tr');
            tr.innerHTML = trVal;
            //tBody.insertRow(-1).innerHTML += tr;
            tBody.insertAdjacentElement("beforeend", tr);
        }
    }
   
}

function selectDate(event) {
    firstDate = event.target.value;
    secondCalendar.disabled = false;
    secondCalendar.setAttribute('min', firstDate);
}

function selectLastDate(event) {
    secondDate = event.target.value;
}

function changeDay(event) {
    typeDay = selectedDays.options[selectedDays.selectedIndex].value;
    return typeDay;
}

function changeMethod(event) {
    method = selectedMethod.options[selectedMethod.selectedIndex].value;
    return method;
}

function resultCounter() {
    if (firstDate === undefined || secondDate === undefined) {
        alert("Оберіть дату")
        return;
    }

    const result = durationBetweenDates(firstDate, secondDate, typeDay, method);
    // викликаємо функцію яка буде додавати до Local Storage
    storeTasksInLocalStorage(firstDate, secondDate, method, result);
    const table = document.getElementsByTagName('table')[0];

    if (!tableResult.contains(table)){
        tableResult.innerHTML = 
        `<table class="table table-bordered">
            <thead>
            <tr>
                <th>Стартова дата</th>
                <th>Кінцева дата</th>
                <th>Результат виміру</th>
            </tr>
            </thead>
            <tbody>
            </tbody>
        </table>`;
    }

    const tBody = document.getElementsByTagName('tbody')[0];
    const trVal = 
    `   <td>${firstDate}</td>
        <td>${secondDate}</td>
        <td>${result} ${method}</td>
    `;
    var tr = document.createElement('tr');
    tr.innerHTML = trVal;
    //tBody.insertRow(-1).innerHTML += tr;
    tBody.insertAdjacentElement("beforeend", tr);
}

const durationBetweenDates = (startDate, endDate, typeDay = 'all', dimension = 'days') => {
        const _SECOND_PER_DAY = 24 * 60 * 60; 
        const _MINUTE_PER_DAY = 24 * 60;
        const _HOUR_PER_DAY = 24;

        startDate = new Date(startDate);
        endDate = new Date(endDate);

        let arr = [];
        for (date = startDate; date <= endDate; date.setDate(date.getDate()+1)) {
            arr.push(new Date(date));
        };

        switch (typeDay) {
            case 'weekdays':
                arr = arr.filter((dataArr) => {
                    if (dataArr.getDay() !== 6 && dataArr.getDay() !== 0) 
                    return dataArr;
                }) 
                break;
            case 'weekends':
                arr = arr.filter((dataArr) => {
                    if (dataArr.getDay() < 6 && dataArr.getDay() > 0) 
                    return dataArr;
                }) 
                break;
            case 'all':
                break;
            default:
                return;
        }


        const amountDays = arr.length;

        const calculationMethods = {
            seconds: () => {
                const seconds = amountDays * _SECOND_PER_DAY;
                return seconds;
            },
            minutes: () => {
                const minutes = amountDays * _MINUTE_PER_DAY;
                return minutes;
            },
            hours: () => {
                const hours = amountDays * _HOUR_PER_DAY;
                return hours;
            },
            days: () => {
                const days = amountDays;
                return days;
            }
        };
    
        if (dimension in calculationMethods) {
            return calculationMethods[dimension]();
        }
    
};

function storeTasksInLocalStorage(firstDate, secondDate, method, result) {
    let results;

    let resultTr = {
        firstDate,
        secondDate,
        method,
        result
    }
    // оголошуємо змінну яка буде використовуватись для списку завдань

    // перевіряємо чи є у localStorage вже якісь записані результати
    if (localStorage.getItem('results') !== null) {
        // якщо вони там є - витягуємо їх і присвоюємо змінній
        results = JSON.parse(localStorage.getItem('results'));
    } else {
        // якщо їх там нема - присвоюємо змінній значення порожнього масиву
        results = [];
    }
    // додаємо до списку новий розрахунок
    results.push(resultTr);

    // зберігаємо список завданнь в Local Storage
    localStorage.setItem('results', JSON.stringify(results));
}
