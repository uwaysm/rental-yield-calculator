// calculator.js

class RentalYieldCalculator {
  constructor() {
    this.isNewHome = false;
    this.purchasePrice = 0;
    this.deposit = 0;
    this.state = "WA";
    this.ownershipType = "";
    this.bedrooms = "";
    this.furnished = false;
    this.furnitureCost = 0;
    this.weeksVacant = 0;
    this.rentPerWeek = 0;
    this.insurance = 0;
    this.legalFees = 0;
    this.propertyManagementFee = 0;
    this.bodyCorporate = 0;
    this.councilRates = 0;
    this.loanInterestRate = 0;
    this.taxableIncome = 0;
    this.loanType = "interestOnly";
    this.isFirstHomeBuyer = false;
    this.propertyType = "Investment";
    this.isEstablishedHome = true;
    this.isForeignPurchaser = false;
    this.isNorthOf26thParallel = false;
    this.paymentFrequency = "annual";
    this.loanDuration = 30;
  }

  setProperty(key, value) {
    if (key === 'loanDuration') {
      this[key] = parseInt(value, 10);
    } else if (typeof value === "string" && !isNaN(parseFloat(value))) {
      this[key] = parseFloat(value);
    } else if (value === "true" || value === "false" || typeof value === "boolean") {
      this[key] = value === true || value === "true";
    } else {
      this[key] = value;
    }
    this.validateInput(key, this[key]);
  }
  validateInput(key, value) {
    const validations = {
      purchasePrice: (v) => v >= 0,
      deposit: (v) => v >= 0 && v <= 100,
      weeksVacant: (v) => v >= 0 && v <= 52,
      rentPerWeek: (v) => v >= 0,
      insurance: (v) => v >= 0,
      legalFees: (v) => v >= 0,
      propertyManagementFee: (v) => v >= 0 && v <= 100,
      bodyCorporate: (v) => v >= 0,
      councilRates: (v) => v >= 0,
      loanInterestRate: (v) => v >= 0 && v <= 100,
      loanDuration: (v) => v >= 1 && v <= 50,
    };

    if (validations[key] && !validations[key](value)) {
      throw new Error(`Invalid input for ${key}: ${value}`);
    }
  }

  calculateTotalIncome() {
    return this.rentPerWeek * (52 - this.weeksVacant);
  }

  calculateManagementFee() {
    return this.calculateTotalIncome() * (this.propertyManagementFee / 100);
  }

  calculateLoanAmount() {
    return this.purchasePrice - this.purchasePrice * (this.deposit / 100);
  }

  calculateLoanInterest() {
    const loanAmount = this.calculateLoanAmount();
    const annualInterestRate = this.loanInterestRate / 100;
    
    if (this.paymentFrequency === "annual") {
      return loanAmount * annualInterestRate;
    } else if (this.paymentFrequency === "monthly") {
      const monthlyInterestRate = annualInterestRate / 12;
      return loanAmount * monthlyInterestRate * 12;
    }
  }

  calculatePrincipalRepayment() {
    if (this.loanType === "principalAndInterest") {
      const loanAmount = this.calculateLoanAmount();
      const annualInterestRate = this.loanInterestRate / 100;
      const numberOfPayments = this.loanDuration * (this.paymentFrequency === "annual" ? 1 : 12);
      const rate = this.paymentFrequency === "annual" ? annualInterestRate : annualInterestRate / 12;
  
      const payment = (loanAmount * rate * Math.pow(1 + rate, numberOfPayments)) / (Math.pow(1 + rate, numberOfPayments) - 1);
      
      if (this.paymentFrequency === "annual") {
        return payment - this.calculateLoanInterest();
      } else {
        return payment * 12 - this.calculateLoanInterest();
      }
    }
    return 0; // No principal repayment for interest-only loans
  }

  calculateTotalExpenses() {
    const expenses =
      this.insurance +
      this.calculateManagementFee() +
      this.bodyCorporate +
      this.councilRates +
      this.calculateLoanInterest();

    if (this.loanType === "principalAndInterest") {
      return expenses + this.calculatePrincipalRepayment();
    }

    return expenses;
  }

  calculateNetCashPosition() {
    return this.calculateTotalIncome() - this.calculateTotalExpenses();
  }

  calculateStampDuty() {
    return this.calculateWAStampDuty().stampDuty;
  }

  calculateTransferFee() {
    return this.calculateWAStampDuty().transferFee;
  }

  calculateMortgageRegistrationFee() {
    return this.calculateWAStampDuty().mortgageRegistrationFee;
  }

  calculatePurchaseCosts() {
    const stampDutyResult = this.calculateWAStampDuty();
    return (
      stampDutyResult.stampDuty +
      stampDutyResult.transferFee +
      stampDutyResult.mortgageRegistrationFee +
      this.purchasePrice * (this.deposit / 100) +
      this.furnitureCost +
      this.legalFees -
      stampDutyResult.firstHomeOwnerGrant
    );
  }

  calculateAfterTaxResult() {
    // Simplified tax calculation - may need refinement based on specific tax rules
    const taxRate = 0.3; // Assuming a 30% tax rate
    const taxableProfit = this.calculateNetCashPosition();
    const tax = taxableProfit > 0 ? taxableProfit * taxRate : 0;
    return this.calculateNetCashPosition() - tax;
  }

  calculateWeeklyCashFlow() {
    return this.calculateAfterTaxResult() / 52;
  }

  calculateWAStampDuty() {
    let stampDuty = 0;
    const mortgageRegistrationFee = 210.3;
    let transferFee = 0;
    const propertyValue = this.purchasePrice;
    let firstHomeOwnerGrant = 0;

    // Calculate First Home Owner Grant
    if (this.isFirstHomeBuyer && !this.isEstablishedHome) {
      if (
        (this.isNorthOf26thParallel && propertyValue <= 1000000) ||
        (!this.isNorthOf26thParallel && propertyValue <= 750000)
      ) {
        firstHomeOwnerGrant = 10000;
      }
    }

    // Calculate stamp duty
    if (this.isFirstHomeBuyer) {
      if (propertyValue <= 430000) {
        stampDuty = 0;
      } else if (propertyValue <= 530000) {
        stampDuty = (propertyValue - 430000) * 0.1919;
      } else {
        stampDuty = this.calculateGeneralRate(propertyValue);
      }
    } else {
      stampDuty = this.calculateGeneralRate(propertyValue);
    }

    // Apply foreign purchaser additional duty
    if (this.isForeignPurchaser) {
      stampDuty += propertyValue * 0.07;
    }

    // Calculate transfer fee
    transferFee = this.calculateTransferFee(propertyValue);

    // Calculate total government fees
    const totalGovernmentFees =
      stampDuty + mortgageRegistrationFee + transferFee;

    return {
      stampDuty: stampDuty,
      mortgageRegistrationFee: mortgageRegistrationFee,
      transferFee: transferFee,
      totalGovernmentFees: totalGovernmentFees,
      firstHomeOwnerGrant: firstHomeOwnerGrant,
    };
  }

  calculateGeneralRate(value) {
    if (value <= 120000) {
      return value * 0.019;
    } else if (value <= 150000) {
      return 2280 + (value - 120000) * 0.0285;
    } else if (value <= 360000) {
      return 3135 + (value - 150000) * 0.038;
    } else if (value <= 725000) {
      return 11115 + (value - 360000) * 0.0475;
    } else {
      return 28453 + (value - 725000) * 0.0515;
    }
  }

  calculateTransferFee() {
    const value = this.purchasePrice;
    const fees = [
      { limit: 85000, fee: 210.3 },
      { limit: 120000, fee: 220.3 },
      { limit: 200000, fee: 240.3 },
      { limit: 300000, fee: 260.3 },
      { limit: 400000, fee: 280.3 },
      { limit: 500000, fee: 300.3 },
      { limit: 600000, fee: 320.3 },
      { limit: 700000, fee: 340.3 },
      { limit: 800000, fee: 360.3 },
      { limit: 900000, fee: 380.3 },
      { limit: 1000000, fee: 400.3 },
      { limit: 1100000, fee: 420.3 },
      { limit: 1200000, fee: 440.3 },
      { limit: 1300000, fee: 460.3 },
      { limit: 1400000, fee: 480.3 },
      { limit: 1500000, fee: 500.3 },
      { limit: 1600000, fee: 520.3 },
      { limit: 1700000, fee: 540.3 },
      { limit: 1800000, fee: 560.3 },
      { limit: 1900000, fee: 580.3 },
      { limit: 2000000, fee: 600.3 },
    ];

    for (let i = 0; i < fees.length; i++) {
      if (value <= fees[i].limit) {
        return fees[i].fee;
      }
    }

    // For values over $2,000,000
    return 600.3 + Math.ceil((value - 2000000) / 100000) * 20;
  }
}

export default RentalYieldCalculator;