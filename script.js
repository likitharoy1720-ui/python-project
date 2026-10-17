const form = document.getElementById("temperature-form");
const temperatureInput = document.getElementById("temperatures");
const resultOutput = document.getElementById("result");
const resultList = document.getElementById("result-list");
const resultCount = document.getElementById("result-count");
const resultStatus = document.getElementById("result-status");
const inputError = document.getElementById("input-error");
const valueCount = document.getElementById("value-count");
const calculateButton = document.getElementById("calculate-button");

function parseTemperatures(value) {
    const entries = value.split(",").map((entry) => entry.trim());
    const numberPattern = /^[+-]?(?:\d+\.?\d*|\.\d+)$/;

    if (entries.some((entry) => !numberPattern.test(entry))) {
        throw new Error("Enter a number for each reading, separated by commas.");
    }

    const temperatures = entries.map(Number);
    if (temperatures.some((temperature) => !Number.isFinite(temperature))) {
        throw new Error("Temperatures must be finite numbers.");
    }

    return temperatures;
}

function calculatePeakHorizon(temperatures) {
    return temperatures.map((temperature, index) => {
        for (let nextIndex = index + 1; nextIndex < temperatures.length; nextIndex += 1) {
            if (temperatures[nextIndex] > temperature) {
                return nextIndex - index;
            }
        }

        return 0;
    });
}

function renderResults(temperatures, horizon, status = "") {
    resultOutput.textContent = `[${horizon.join(", ")}]`;
    resultCount.textContent = `${temperatures.length} ${temperatures.length === 1 ? "DAY" : "DAYS"}`;
    resultStatus.textContent = status;
    resultList.replaceChildren();

    temperatures.forEach((temperature, index) => {
        const item = document.createElement("li");
        item.className = "result-item";
        if (horizon[index] === 0) item.classList.add("no-rise");

        const label = document.createElement("span");
        label.className = "day-label";
        label.textContent = `Day ${index + 1}`;

        const values = document.createElement("span");
        values.className = "day-value";

        const temperatureValue = document.createElement("strong");
        temperatureValue.textContent = `${temperature}°`;

        const waitValue = document.createElement("span");
        waitValue.className = "wait-value";
        waitValue.textContent = horizon[index] === 0
            ? "No rise"
            : `${horizon[index]} ${horizon[index] === 1 ? "day" : "days"}`;

        values.append(temperatureValue, waitValue);
        item.append(label, values);
        resultList.append(item);
    });
}

function updateValueCount() {
    const count = temperatureInput.value.split(",").filter((entry) => entry.trim()).length;
    valueCount.textContent = `${count} ${count === 1 ? "reading" : "readings"}`;
}

temperatureInput.addEventListener("input", () => {
    inputError.textContent = "";
    updateValueCount();
});

document.getElementById("example-button").addEventListener("click", () => {
    temperatureInput.value = "73, 74, 75, 71, 69, 72, 76, 73";
    inputError.textContent = "";
    updateValueCount();
    const temperatures = parseTemperatures(temperatureInput.value);
    renderResults(temperatures, calculatePeakHorizon(temperatures), "Example loaded.");
});

document.getElementById("clear-button").addEventListener("click", () => {
    temperatureInput.value = "";
    inputError.textContent = "";
    updateValueCount();
    renderResults([], [], "Enter temperatures to see the outlook.");
    temperatureInput.focus();
});

async function findPeak(event) {
    event.preventDefault();
    inputError.textContent = "";

    let temperatures;
    try {
        temperatures = parseTemperatures(temperatureInput.value.trim());
    } catch (error) {
        inputError.textContent = error.message;
        temperatureInput.focus();
        return;
    }

    calculateButton.disabled = true;
    calculateButton.querySelector("span:first-child").textContent = "Calculating...";
    let horizon = calculatePeakHorizon(temperatures);
    let status = "Calculated in your browser.";

    if (window.location.protocol !== "file:") {
        try {
            const response = await fetch("/calculate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ temperatures }),
            });
            if (!response.ok) throw new Error("Calculation service unavailable");

            const data = await response.json();
            horizon = data.result;
            status = data.saved_to_database ? "Calculation saved." : "Calculated successfully.";
        } catch {
            status = "Calculated in your browser. Start the Flask app to enable saving.";
        }
    }

    renderResults(temperatures, horizon, status);
    calculateButton.disabled = false;
    calculateButton.querySelector("span:first-child").textContent = "Track peak horizon";
}

form.addEventListener("submit", findPeak);

updateValueCount();
const initialTemperatures = parseTemperatures(temperatureInput.value);
renderResults(initialTemperatures, calculatePeakHorizon(initialTemperatures));