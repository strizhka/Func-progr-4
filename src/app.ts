type CalculatorState = {
    expression: string;
    history: string[];
};

const initialState: CalculatorState = {
    expression: "",
    history: [],
};

const appendToExpression = (state: CalculatorState, value: string): CalculatorState => ({
    ...state,
    expression: state.expression + value,
});

const removeLastCharacter = (state: CalculatorState): CalculatorState => ({
    ...state,
    expression: state.expression.slice(0, -1),
});

const resetState = (): CalculatorState => ({ expression: "", history: [] });

const getEvaluableExpression = (expr: string): string =>
    expr
        .replace(/÷/g, "/")
        .replace(/×/g, "*")
        .replace(/\^/g, "**")
        .replace(/√\(/g, "Math.sqrt(");

const evaluateExpression = (expr: string): number | Error => {
    const evaluableExpr = getEvaluableExpression(expr);
    try {
        const result = new Function(`return ${evaluableExpr}`)();
        if (typeof result === "number" && !isNaN(result)) {
            return result;
        } else {
            throw new Error("Ошибка в выражении");
        }
    } catch (err) {
        return new Error("Ошибка вычисления");
    }
};

const calculateResult = (state: CalculatorState): CalculatorState => {
    if (state.expression === "") return state;
    const result = evaluateExpression(state.expression);
    if (result instanceof Error) {
        return state;
    }
    return {
        expression: result.toString(),
        history: [...state.history, `${state.expression} = ${result}`],
    };
};

function updateUI(state: CalculatorState): void {
    const currentDisplay = document.getElementById("currentDisplay") as HTMLInputElement;
    const historyDisplay = document.getElementById("historyDisplay") as HTMLElement;
    currentDisplay.value = state.expression || "0";
    historyDisplay.innerHTML = state.history.join("<br>");
}

function init(): void {
    let state: CalculatorState = initialState;

    const update = (newState: CalculatorState): void => {
        state = newState;
        updateUI(state);
    };

    document.querySelectorAll(".digit").forEach(button => {
        button.addEventListener("click", () => {
            const digit = (button as HTMLElement).getAttribute("data-digit") || "";
            update(appendToExpression(state, digit));
        });
    });

    ["add", "subtract", "multiply", "divide", "power", "dot"].forEach(op => {
        document.getElementById(op)?.addEventListener("click", () => {
            const symbols: Record<string, string> = {
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

    document.getElementById("sqrt")?.addEventListener("click", () => {
        if (state.expression === "" || state.expression.includes("√(")) return;
        const value = evaluateExpression(state.expression);
        if (typeof value === "number" && value >= 0) {
            update({
                ...state,
                expression: `√(${state.expression})`,
            });
        } else {
            alert("Ошибка: корень из отрицательного числа!");
        }
    });

    document.getElementById("equals")?.addEventListener("click", () => {
        update(calculateResult(state));
    });

    document.getElementById("backspace")?.addEventListener("click", () => {
        update(removeLastCharacter(state));
    });

    document.getElementById("clear")?.addEventListener("click", () => {
        update(resetState());
    });

    document.addEventListener("keydown", (event: KeyboardEvent) => {
        const key = event.key;
        if (/[\d\+\-\*\/\.\(\)]/.test(key)) {
            update(appendToExpression(state, key));
        } else if (key === "Enter") {
            update(calculateResult(state));
        } else if (key === "Backspace") {
            update(removeLastCharacter(state));
        } else if (key === "Escape") {
            update(resetState());
        }
    });

    updateUI(state);
}

init();

