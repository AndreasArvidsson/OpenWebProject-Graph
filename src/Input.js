function Input(attr) {
    const input = document.createElement("input");
    if (attr) {
        for (let i in attr) {
            input.setAttribute(i, attr[i]);
        }
    }

    function callback() {
        const value = parseInt(input.value);
        if (isNaN(value) || value < 0) {
            input.value = 0;
        }
        //Trigger custom enter event.
        input.dispatchEvent(new Event("done"));
    }

    //Loose focus or enter fires the format callback.
    input.addEventListener("change", callback);

    //Enter key pressed.
    input.addEventListener("keypress", e => {
        if (e.which === 13) {
            callback();
        }
    });

    return input;
}

export default Input;