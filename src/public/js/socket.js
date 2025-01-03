const soket = io();
const connectionButton = document.querySelector(".connect-to-server");

async function handleClickConnection(event) {
  event.preventDefault();
  alert(1);
}

connectionButton.addEventListener("click", handleClickConnection);
