var Kalkulator = {

  display: document.querySelector('#display div'),
  currentOperationEle: null,
  result: 0,
  batasDigits: 9,
  currentInput: '',
  operationToBeApplied: '',
  inputDigits: 0,

  updateDisplay: function updateDisplay() {
    var value = this.currentInput || this.result.toString();
    var infinite = new RegExp((1 / 0) + '', 'g');
    var output = value.replace(infinite, '∞').replace(NaN, 'Salah Input');
    this.display.textContent = output;
  },

  appendDigit: function appendDigit(value) {
    if (this.inputDigits + 1 > this.batasDigits ||
        this.currentInput === '0' && value === '0') {
      return;
    }
    if (value === '.') {
      if (this.decimalMark) {
        return;
      } else {
        this.decimalMark = true;
      }
      if (!this.currentInput) {
        this.currentInput += '0';
      }
    } else {
      if (this.currentInput === '0' && value !== '0') {
        this.currentInput = '';
      } else {
        ++this.inputDigits;
      }
    }
    if (!this.operationToBeApplied) {
      this.result = 0;
    }
    this.currentInput += value;
    this.updateDisplay();
  },

  appendOperator: function appendOperator(value) {
    this.decimalMark = false;
    if (this.operationToBeApplied && this.currentInput) {
      this.calculate();
    } else if (!this.result) {
      this.result = parseFloat(this.currentInput);
      this.currentInput = '';
    }
    switch (value) {
      case '+':
        this.operationToBeApplied = '+';
        break;
      case '-':
        if (this.currentInput || this.result) {
          this.operationToBeApplied = '-';
        } else {
          this.currentInput += '-';
          this.updateDisplay();
        }
        break;
      case '×':
        this.operationToBeApplied = '*';
        break;
      case '÷':
        this.operationToBeApplied = '/';
        break;
    }
    this.inputDigits = 0;
  },

  backSpace: function backSpace() {
    this.currentInput = '';
    this.operationToBeApplied = '';
    this.result = 0;
    this.inputDigits = 0;
    this.decimalMark = false;
    this.updateDisplay();
  },

  calculate: function calculate() {
    var tempResult = 0,
        result = parseFloat(this.result),
        currentInput = parseFloat(this.currentInput);
    switch (this.operationToBeApplied) {
      case '+':
        tempResult = result + currentInput;
        break;
      case '-':
        tempResult = result - currentInput;
        break;
      case '*':
        tempResult = result * currentInput;
        break;
      case '/':
        if (currentInput == 0) {
            tempResult = NaN;
        } else {
            tempResult = result / currentInput;
        }
        break;
    }
    this.result = parseFloat(tempResult.toPrecision(this.batasDigits));
    if (tempResult >  this.maxDisplayableValue ||
        tempResult < -this.maxDisplayableValue) {
      this.result = this.result.toExponential();
    }

    this.currentInput = '';
    this.operationToBeApplied = '';
    this.inputDigits = 0;
    this.decimalMark = false;
    this.updateDisplay();
  },

  init: function init() {
    this.display.style.lineHeight = + this.display.offsetHeight + "px";
    document.addEventListener('mousedown', this);
    document.addEventListener('touchstart', function(evt){
      var target = evt.target;
      if ((target.dataset.type == "value") || (target.value == "Reset") || (target.value == "=")) {
        target.classList.add("active");
      }
    });
    document.addEventListener('touchend', function(evt){
      var target = evt.target;
      if ((target.dataset.type == "value") || (target.value == "Reset") || (target.value == "=")) {
        target.classList.remove("active");
      }
    });
    this.updateDisplay();
  },

  removeCurrentOperationEle: function removeCurrentOperationEle() {
    if (this.currentOperationEle) {
      this.currentOperationEle.classList.remove('active');
      this.currentOperationEle = null;
    }
  },

  handleEvent: function handleEvent(evt) {
    var target = evt.target;
    var value = target.value;

    navigator.vibrate(50);
    switch (target.dataset.type) {
      case 'value':
        this.appendDigit(value);
        break;
      case 'operator':
        if (value === '-' && this.currentInput === '-') {
          return;
        }
        this.removeCurrentOperationEle();
        if (this.currentInput || this.result) {
          target.classList.add('active');
        }
        this.currentOperationEle = target;
        if (this.currentInput || this.result || value === '-') {
          this.appendOperator(value);
        }
        break;
      case 'command':
        switch (value) {
          case 'Reset':
            this.removeCurrentOperationEle();
            this.backSpace();
            break;
            case '=':
            if (this.currentInput && this.operationToBeApplied &&
                typeof this.result === 'number') {
              this.removeCurrentOperationEle();
              this.calculate();
            }
            break;
        }
        break;
    }
  }
};

Kalkulator.maxDisplayableValue = '1e' + Kalkulator.batasDigits - 1;

window.addEventListener('load', function load(evt) {
  window.removeEventListener('load', load);
  Kalkulator.init();
});
