const ipcRenderer = window.require('electron').ipcRenderer;

// Show the error message for 5 seconds
function showError(id){
    document.getElementById(`invalid-feedback-${id}`).style = "";
    setTimeout(() => {
        document.getElementById(`invalid-feedback-${id}`).style = "display: none;";
    }, 5000)
}


// Execute submit function
function submit() {
    // Define variables
    let icao = document.getElementById("icao");
    let flightawareAPI = document.getElementById("flightaware-api")

    // Validate variables
    if(icao.value == "")return showError("icao")
    if(icao.value.length != 3)return alert("ICAO must be 3 letters long!")
    if(flightawareAPI.value == "")return showError("flightaware-api")


    // Send the data to backend
    ipcRenderer.sendSync("initStore", icao.value, flightawareAPI.value)
    
    return true;
}