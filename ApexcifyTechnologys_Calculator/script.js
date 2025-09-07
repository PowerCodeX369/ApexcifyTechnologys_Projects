class Calculator {
            constructor() {
                this.expression = '';
                this.result = '0';
                this.history = [];
                this.maxHistory = 10;
                this.lastWasEquals = false;
                
                this.expressionEl = document.getElementById('expression');
                this.resultEl = document.getElementById('result');
                this.historyListEl = document.getElementById('historyList');
                
                this.init();
            }
            
            init() {
                this.attachButtonListeners();
                this.attachKeyboardListeners();
            }
            
            attachButtonListeners() {
                document.querySelectorAll('.btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        this.createRipple(e);
                        this.handleButtonClick(btn);
                    });
                });
            }
            
            attachKeyboardListeners() {
                document.addEventListener('keydown', (e) => {
                    const key = e.key;
                    
                    if (key >= '0' && key <= '9') {
                        this.appendValue(key);
                    } else if (['+', '-', '*', '/'].includes(key)) {
                        this.appendValue(key);
                    } else if (key === '.') {
                        this.appendValue('.');
                    } else if (key === 'Enter' || key === '=') {
                        e.preventDefault();
                        this.calculate();
                    } else if (key === 'Backspace') {
                        e.preventDefault();
                        this.backspace();
                    } else if (key === 'Escape') {
                        this.clearAll();
                    }
                });
            }
            
            handleButtonClick(btn) {
                const value = btn.dataset.value;
                const action = btn.dataset.action;
                
                if (value) {
                    this.appendValue(value);
                } else if (action) {
                    switch(action) {
                        case 'clear-all':
                            this.clearAll();
                            break;
                        case 'clear-entry':
                            this.clearEntry();
                            break;
                        case 'backspace':
                            this.backspace();
                            break;
                        case 'equals':
                            this.calculate();
                            break;
                    }
                }
            }
            
            appendValue(value) {
                if (this.lastWasEquals && !isNaN(value)) {
                    this.expression = '';
                    this.lastWasEquals = false;
                } else if (this.lastWasEquals && isNaN(value)) {
                    this.lastWasEquals = false;
                }
                
                // Prevent multiple operators in a row (except negative at start)
                const operators = ['+', '-', '*', '/'];
                const lastChar = this.expression.slice(-1);
                
                if (operators.includes(value) && operators.includes(lastChar)) {
                    if (!(value === '-' && lastChar !== '-')) {
                        return;
                    }
                }
                
                // Prevent multiple decimals in same number
                if (value === '.') {
                    const parts = this.expression.split(/[\+\-\*\/]/);
                    const currentNumber = parts[parts.length - 1];
                    if (currentNumber.includes('.')) {
                        return;
                    }
                }
                
                // Prevent starting with operators except minus
                if (this.expression === '' && operators.includes(value) && value !== '-') {
                    return;
                }
                
                this.expression += value;
                this.updateDisplay();
                this.evaluateRealtime();
            }
            
            clearAll() {
                this.expression = '';
                this.result = '0';
                this.lastWasEquals = false;
                this.updateDisplay();
            }
            
            clearEntry() {
                const parts = this.expression.match(/(\d+\.?\d*|[\+\-\*\/])/g);
                if (parts && parts.length > 0) {
                    parts.pop();
                    this.expression = parts.join('');
                }
                this.updateDisplay();
                this.evaluateRealtime();
            }
            
            backspace() {
                this.expression = this.expression.slice(0, -1);
                this.updateDisplay();
                this.evaluateRealtime();
            }
            
            evaluateRealtime() {
                if (!this.expression) {
                    this.result = '0';
                    this.resultEl.classList.remove('error');
                    this.resultEl.textContent = this.result;
                    return;
                }
                
                try {
                    const evalExpression = this.expression.replace(/×/g, '*').replace(/÷/g, '/');
                    const result = Function('"use strict"; return (' + evalExpression + ')')();
                    
                    if (!isFinite(result)) {
                        throw new Error('Invalid operation');
                    }
                    
                    this.result = this.formatResult(result);
                    this.resultEl.classList.remove('error');
                } catch (e) {
                    // Don't show error for incomplete expressions
                    if (this.expression && !['+', '-', '*', '/', '.'].includes(this.expression.slice(-1))) {
                        this.result = 'Error';
                        this.resultEl.classList.add('error');
                    }
                }
                
                this.resultEl.textContent = this.result;
            }
            
            calculate() {
                if (!this.expression) return;
                
                try {
                    const evalExpression = this.expression.replace(/×/g, '*').replace(/÷/g, '/');
                    const result = Function('"use strict"; return (' + evalExpression + ')')();
                    
                    if (!isFinite(result)) {
                        throw new Error('Invalid operation');
                    }
                    
                    this.result = this.formatResult(result);
                    this.resultEl.classList.remove('error');
                    
                    // Add to history
                    this.addToHistory(this.expression, this.result);
                    
                    // Animate result
                    this.resultEl.classList.add('final');
                    setTimeout(() => this.resultEl.classList.remove('final'), 300);
                    
                    // Set expression to result for continued calculation
                    this.expression = this.result.toString();
                    this.lastWasEquals = true;
                } catch (e) {
                    this.result = 'Error';
                    this.resultEl.classList.add('error');
                }
                
                this.updateDisplay();
            }
            
            formatResult(num) {
                if (Math.abs(num) < 1e-10 && num !== 0) return '0';
                if (Math.abs(num) > 1e10) return num.toExponential(4);
                return Math.round(num * 100000000) / 100000000;
            }
            
            updateDisplay() {
                this.expressionEl.textContent = this.expression || '';
                this.resultEl.textContent = this.result;
            }
            
            addToHistory(expr, result) {
                const historyItem = {
                    expression: expr,
                    result: result,
                    timestamp: new Date()
                };
                
                this.history.unshift(historyItem);
                if (this.history.length > this.maxHistory) {
                    this.history.pop();
                }
                
                this.updateHistoryDisplay();
            }
            
            updateHistoryDisplay() {
                if (this.history.length === 0) {
                    this.historyListEl.innerHTML = '<div class="empty-history">No calculations yet</div>';
                    return;
                }
                
                this.historyListEl.innerHTML = '';
                this.history.forEach((item, index) => {
                    const historyEl = document.createElement('div');
                    historyEl.className = 'history-item';
                    historyEl.innerHTML = `
                        <div class="history-calc">
                            <div class="history-expr">${item.expression}</div>
                            <div class="history-result">= ${item.result}</div>
                        </div>
                        <button class="load-btn" data-index="${index}">Load</button>
                    `;
                    
                    historyEl.querySelector('.load-btn').addEventListener('click', () => {
                        this.loadFromHistory(index);
                    });
                    
                    this.historyListEl.appendChild(historyEl);
                });
            }
            
            loadFromHistory(index) {
                const item = this.history[index];
                this.expression = item.expression;
                this.result = item.result;
                this.updateDisplay();
                this.lastWasEquals = false;
            }
            
            createRipple(e) {
                const btn = e.currentTarget;
                const ripple = document.createElement('span');
                ripple.classList.add('ripple');
                
                const rect = btn.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                
                btn.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
            }
        }
        
        // Initialize calculator when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            new Calculator();
        });