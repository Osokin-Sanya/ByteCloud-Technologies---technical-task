"use strict";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
const createElem = (elem) => document.createElement(elem);

const providerDataArray = [
  {
    "backblaze.com": {
      minPayment: 7,
      priceStorage: 0.005,
      priceTransfer: 0.01,
    },
  },
  {
    "bunny.net": {
      maxPayment: 10,
      storage: {
        HDD: 0.01,
        SSD: 0.02,
      },
      priceTransfer: 0.01,
    },
  },
  {
    "scaleway.net": {
      options: {
        multi: { free: 75, payment: 0.06 },
        single: { free: 75, payment: 0.03 },
      },
      priceTransfers: { free: 75, payment: 0.02 },
    },
  },
  {
    "vultr.com": {
      minPayment: 5,
      priceStorage: 0.01,
      priceTransfer: 0.01,
    },
  },
];

const storageValue = $(".storage-value");
const transferValue = $(".transfer-value");
const storageRange = $(".storage-range");
const transferRange = $(".transfer-range");

// Функция для создания элементов провайдера на странице.
function createProvider() {
  const scheduleItems = $(".schedule-items");
  let index = 0;

  for (const item of providerDataArray) {
    index++;
    const provider = createElem("p");
    const column = createElem("div");
    const price = createElem("div");
    const wrapper = createElem("div");
    const wrapperNameAndRadio = createElem("div");

    const [arr] = Object.values(item);

    const classNameColumns = Object.keys(item)[0].split(".")[0];

    provider.textContent = Object.keys(item)[0];
    column.className = `${classNameColumns} column column${index}`;
    wrapper.className = "schedule-item";
    price.className = `price${index}`;
    price.textContent = arr.minPayment ? arr.minPayment + "$" : "0$";
    column.style.width = `${arr.minPayment * 5}px`;

    wrapper.appendChild(wrapperNameAndRadio);
    wrapperNameAndRadio.appendChild(provider);
    wrapper.appendChild(column);
    wrapper.appendChild(price);

    // Функция для создания радиокнопок и меток.
    function createRadioAndLabel(
      wrapper,
      className,
      radioName,
      radioClassName
    ) {
      for (let i = 0; i < Object.values(arr[className]).length; i++) {
        console.log(Object.values(arr[className]));
        const radio = createElem("input");
        const label = createElem("label");

        radio.type = "radio";
        radio.name = radioName;
        radio.checked = "checked";
        radio.className = `radio ${radioClassName}${i}`;

        label.textContent = Object.keys(arr[className])[i];
        wrapper.appendChild(radio);
        wrapper.appendChild(label);
      }
    }

    if (arr.storage) {
      createRadioAndLabel(
        wrapperNameAndRadio,
        "storage",
        "radio",
        "radio-storage"
      );
    }

    if (arr.options) {
      createRadioAndLabel(
        wrapperNameAndRadio,
        "options",
        "options",
        "radio-options"
      );
    }
    scheduleItems.appendChild(wrapper);
  }
}
createProvider();

// Функция для обновления цен и ширины колонок при изменении значений радиокнопок.
function changeRange() {
  let index = 0;
  let intermediatePrice = 0;
  let intermediateTransfer = 0;
  let freeStorage = 0;
  let paymentStorage = 0;
  let freeTransfers = 0;
  let paymentTransfers = 0;

  for (const item of providerDataArray) {
    index++;
    const column = $(`.column${index}`);
    const price = $(`.price${index}`);
    const [arr] = Object.values(item);

    // Обработка данных провайдера и расчет промежуточных значений.
    if (arr.storage) {
      for (let i = 0; i < Object.values(arr.storage).length; i++) {
        const radio = $(`.radio-storage${i}`);
        if (radio.checked) {
          intermediatePrice = Object.values(arr.storage)[i];
        }
      }
    }

    if (arr.options) {
      for (let i = 0; i < Object.values(arr.options).length; i++) {
        const options = $(`.radio-options${i}`);
        freeStorage = Object.values(arr.options)[i].free;
        paymentStorage = Object.values(arr.options)[i].payment;

        if (options.checked) {
          if (storageRange.value >= freeStorage) {
            intermediatePrice = Object.values(arr.options)[i].payment;
          } else {
            intermediatePrice = 0;
          }
        }
      }
    } else {
      freeStorage = 0;
    }

    if (typeof arr.priceTransfers == "object") {
      freeTransfers = arr.priceTransfers.free;
      paymentTransfers = arr.priceTransfers.payment;

      if (transferRange.value >= freeTransfers) {
        intermediateTransfer = paymentTransfers;
      } else {
        intermediateTransfer = 0;
      }
    } else {
      freeTransfers = 0;
    }

    // Расчет общей цены на основе промежуточных значений и обновление элементов на странице.
    let priceValue = (
      (storageRange.value - freeStorage) *
        (arr.priceStorage || intermediatePrice) +
      (transferRange.value - freeTransfers) *
        (arr.priceTransfer || intermediateTransfer)
    ).toFixed(2);

    if (arr.minPayment) {
      price.textContent =
        priceValue <= arr.minPayment ? arr.minPayment + "$" : priceValue + "$";
      column.style.width =
        priceValue <= arr.minPayment
          ? arr.minPayment * 3 + "px"
          : priceValue * 3 + "px";
    } else {
      price.textContent =
        priceValue >= arr.maxPayment ? arr.maxPayment + "$" : priceValue + "$";
      column.style.width =
        priceValue >= arr.maxPayment
          ? arr.maxPayment * 3 + "px"
          : priceValue * 3 + "px";
    }

    storageValue.textContent = storageRange.value;
    transferValue.textContent = transferRange.value;
  }
}
for (const radio of $$(".radio")) {
  radio.addEventListener("click", changeRange);
}
