let newPasswordValue;
let confirmationPasswordValue;
const form = document.querySelector("form");
const validationMsg = document.querySelector("#validation-message");
const newPassword = document.querySelector("#new-password");
const confirmPassword = document.querySelector("#password-confirmation");
const submitBtn = document.querySelector("#submitBtn");

function validatePasswords(msg, add, remove) {
    validationMsg.textContent = msg;
    validationMsg.classList.add(add);
    validationMsg.classList.remove(remove);
}

confirmPassword.addEventListener("input", function (e) {
    e.preventDefault();
    newPasswordValue = newPassword.value;
    confirmationPasswordValue = confirmPassword.value;
    if (newPasswordValue === confirmationPasswordValue) {
        validatePasswords("Passwords Match", "color-green", "color-red");
        submitBtn.disabled = false;
    } else {
        validatePasswords("Passwords Must Match", "color-red", "color-green");
        submitBtn.disabled = true;
    }
});