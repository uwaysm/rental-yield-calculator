// ui.js

import RentalYieldCalculator from "./calculator.js";

class UI {
  constructor() {
    this.calculator = new RentalYieldCalculator();
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    document.querySelectorAll("input, select").forEach((input) => {
      input.addEventListener("change", this.handleInputChange.bind(this));
    });

    // Add specific listeners for fields that affect stamp duty
    const stampDutyFields = [
      "isFirstHomeBuyer",
      "isForeignPurchaser",
      "isEstablishedHome",
    ];
    stampDutyFields.forEach((fieldId) => {
      const element = document.getElementById(fieldId);
      if (element) {
        element.addEventListener("change", this.updateStampDuty.bind(this));
      } else {
        console.warn(`Element with id '${fieldId}' not found`);
      }
    });

    const loanDurationSlider = document.getElementById('loanDuration');
    if (loanDurationSlider) {
      loanDurationSlider.addEventListener('input', (event) => {
        this.calculator.setProperty('loanDuration', event.target.value);
        this.updateLoanRelatedFields();
      });
    }

    const paymentFrequencySelect = document.getElementById('paymentFrequency');
    if (paymentFrequencySelect) {
      paymentFrequencySelect.addEventListener('change', (event) => {
        this.calculator.setProperty('paymentFrequency', event.target.value);
        this.updateLoanRelatedFields();
      });
    }
  }


  handleInputChange(event) {
    const { name, value } = event.target;
    this.calculator.setProperty(name, value);
  
    if (name === 'loanDuration' || name === 'paymentFrequency' || name === 'loanType') {
      this.updateLoanRelatedFields();
    } else {
      this.updateResults();
    }
  }
  
  updateLoanRelatedFields() {
    const interestExpense = this.calculator.calculateLoanInterest();
    document.getElementById("interestExpense").textContent = UI.formatCurrency(interestExpense);
  
    const principalRepayment = this.calculator.calculatePrincipalRepayment();
    const principalRepaymentElement = document.getElementById("principalRepayment");
    if (principalRepaymentElement) {
      principalRepaymentElement.textContent = UI.formatCurrency(principalRepayment);
    }
  
    const totalExpenses = this.calculator.calculateTotalExpenses();
    document.getElementById("totalExpenses").textContent = UI.formatCurrency(totalExpenses);
  
    const netCashPosition = this.calculator.calculateNetCashPosition();
    document.getElementById("netCashPosition").textContent = UI.formatCurrency(netCashPosition);
  
    const afterTaxResult = this.calculator.calculateAfterTaxResult();
    document.getElementById("afterTaxResult").textContent = UI.formatCurrency(afterTaxResult);
  
    document.getElementById("weeklyCashFlow").textContent = UI.formatCurrency(
      this.calculator.calculateWeeklyCashFlow()
    );
  
    // Update loan duration display
    const loanDurationElement = document.getElementById("loanDurationValue");
    if (loanDurationElement) {
      loanDurationElement.textContent = this.calculator.loanDuration;
    }
  
    console.log("Updated calculator state:", this.calculator);
    this.updateResults(); // Add this line to ensure all fields are updated
  }

  updateStampDuty() {
    const stampDutyResult = this.calculator.calculateWAStampDuty();

    document.getElementById("stampDuty").textContent = UI.formatCurrency(
      stampDutyResult.stampDuty
    );

    console.log("Calculated transfer fee:", stampDutyResult.transferFee);
    document.getElementById("transferFee").textContent = UI.formatCurrency(
      stampDutyResult.transferFee
    );

    const firstHomeOwnerGrantElement = document.getElementById(
      "firstHomeOwnerGrant"
    );
    if (firstHomeOwnerGrantElement) {
      firstHomeOwnerGrantElement.textContent = UI.formatCurrency(
        stampDutyResult.firstHomeOwnerGrant
      );
    }
    document.getElementById("mortgageRegistrationFee").textContent =
      UI.formatCurrency(stampDutyResult.mortgageRegistrationFee);

    const totalCapitalRequired =
      this.calculator.calculatePurchaseCosts() -
      stampDutyResult.firstHomeOwnerGrant;
    document.getElementById("totalCapitalRequired").textContent =
      UI.formatCurrency(totalCapitalRequired);
  }
  
  updateResults() {
    this.updateStampDuty();

    const interestExpense = this.calculator.calculateLoanInterest();
    document.getElementById("interestExpense").textContent =
      UI.formatCurrency(interestExpense);

    const principalRepayment = this.calculator.calculatePrincipalRepayment();
    const principalRepaymentElement =
      document.getElementById("principalRepayment");
    if (principalRepaymentElement) {
      principalRepaymentElement.textContent =
        UI.formatCurrency(principalRepayment);
    }

    document.getElementById("totalIncome").textContent = UI.formatCurrency(
      this.calculator.calculateTotalIncome()
    );

    document.getElementById("managementFee").textContent = UI.formatCurrency(
      this.calculator.calculateManagementFee()
    );

    const totalExpenses = this.calculator.calculateTotalExpenses();
    document.getElementById("totalExpenses").textContent =
      UI.formatCurrency(totalExpenses);

    const netCashPosition = this.calculator.calculateNetCashPosition();
    document.getElementById("netCashPosition").textContent =
      UI.formatCurrency(netCashPosition);

    const afterTaxResult = this.calculator.calculateAfterTaxResult();
    document.getElementById("afterTaxResult").textContent =
      UI.formatCurrency(afterTaxResult);

    document.getElementById("weeklyCashFlow").textContent = UI.formatCurrency(
      this.calculator.calculateWeeklyCashFlow()
    );

    console.log("Current calculator state:", this.calculator);
    console.log("Total Expenses:", totalExpenses);
    console.log("Net Cash Position:", netCashPosition);
    console.log("After Tax Result:", afterTaxResult);
  }

  static formatCurrency(amount) {
    if (isNaN(amount) || amount === null) {
      console.error("Invalid amount for currency formatting:", amount);
      return "$0.00";
    }
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new UI();
});

export default UI;