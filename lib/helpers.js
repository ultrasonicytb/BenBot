const pageDichotomy = async (func) => {
    // Find the first page without knowing the total number of pages
    let min = 1;
    let max = 1000;
    let page = max;
    let result;
    // Check if the page exists
    while (true){
        // If the page doesn't exist, divide the interval by 2
        if (max - min == 0){
            // The page should be the first page
            return 1;
        }
        result = func(page)
        if (result != true && result != false){
            return result;
        }
        if (result== true){
            // If the page exists, update the minimum page number
            min = page;
            break;
        }
        max = page;
        page = Math.floor((min + max) / 2);
    }

    // Find the last page
    while (true){
        if (max - min == 1){
            // If the difference between the minimum and maximum page numbers is 1, the last page is the maximum page number
            return max;
        }
        page = Math.floor((max + min) / 2);
        result = func(page)
        if (result != true && result != false){
            return result;
        }
        if (result == true){
            // If the page exists, update the minimum page number
            min = page;
        } else {
            // If the page doesn't exist, update the maximum page number
            max = page;
        }
    }
}


const format = (string, arguments) => {
    // Format a string with named arguments (e.g. "Hello {name}, {greeting}!")
    let formatted = string;
    for (let arg in arguments) {
        formatted = formatted.replace("{" + arg + "}", arguments[arg]);
    }
    return formatted;
}

module.exports = { pageDichotomy : pageDichotomy, format : format };