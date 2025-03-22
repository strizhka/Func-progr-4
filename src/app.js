"use strict";
const initialState = {
    expression: "",
    history: [],
};
const appendToExpression = (state, value) => (Object.assign(Object.assign({}, state), { expression: state.expression + value }));
const removeLastCharacter = (state) => (Object.assign(Object.assign({}, state), { expression: state.expression.slice(0, -1) }));
const resetState = () => ({ expression: "", history: [] });
const getEvaluableExpression = (expr) => expr
    .replace(/÷/g, "/")
    .replace(/×/g, "*")
    .replace(/\^/g, "**")
    .replace(/√\(/g, "Math.sqrt(");
const evaluateExpression = (expr) => {
    const evaluableExpr = getEvaluableExpression(expr);
    try {
        const result = new Function(`return ${evaluableExpr}`)();
        if (typeof result === "number" && !isNaN(result)) {
            return result;
        }
        else {
            throw new Error("Ошибка в выражении");
        }
    }
    catch (err) {
        return new Error("Ошибка вычисления");
    }
};
const calculateResult = (state) => {
    if (state.expression === "")
        return state;
    const result = evaluateExpression(state.expression);
    if (result instanceof Error) {
        return state;
    }
    return {
        expression: result.toString(),
        history: [...state.history, `${state.expression} = ${result}`],
    };
};
function updateUI(state) {
    const currentDisplay = document.getElementById("currentDisplay");
    const historyDisplay = document.getElementById("historyDisplay");
    currentDisplay.value = state.expression || "0";
    historyDisplay.innerHTML = state.history.join("<br>");
}
function init() {
    var _a, _b, _c, _d;
    let state = initialState;
    const update = (newState) => {
        state = newState;
        updateUI(state);
    };
    document.querySelectorAll(".digit").forEach(button => {
        button.addEventListener("click", () => {
            const digit = button.getAttribute("data-digit") || "";
            update(appendToExpression(state, digit));
        });
    });
    ["add", "subtract", "multiply", "divide", "power", "dot"].forEach(op => {
        var _a;
        (_a = document.getElementById(op)) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
            const symbols = {
                add: "+",
                subtract: "-",
                multiply: "×",
                divide: "÷",
                power: "^",
                dot: ".",
            };
            update(appendToExpression(state, symbols[op]));
        });
    });
    (_a = document.getElementById("sqrt")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
        if (state.expression === "" || state.expression.includes("√("))
            return;
        const value = evaluateExpression(state.expression);
        if (typeof value === "number" && value >= 0) {
            update(Object.assign(Object.assign({}, state), { expression: `√(${state.expression})` }));
        }
        else {
            alert("Ошибка: корень из отрицательного числа!");
        }
    });
    (_b = document.getElementById("equals")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
        update(calculateResult(state));
    });
    (_c = document.getElementById("backspace")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => {
        update(removeLastCharacter(state));
    });
    (_d = document.getElementById("clear")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", () => {
        update(resetState());
    });
    document.addEventListener("keydown", (event) => {
        const key = event.key;
        if (/[\d\+\-\*\/\.\(\)]/.test(key)) {
            update(appendToExpression(state, key));
        }
        else if (key === "Enter") {
            update(calculateResult(state));
        }
        else if (key === "Backspace") {
            update(removeLastCharacter(state));
        }
        else if (key === "Escape") {
            update(resetState());
        }
    });
    updateUI(state);
}
init();
