document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
  if (!isLoggedIn) {
    window.location.href = "login.html"
    return
  }

  // Get user data from localStorage
  const userString = localStorage.getItem("user")
  let user = null

  if (userString) {
    try {
      user = JSON.parse(userString)

      // Update from account select with balance
      const fromAccountSelect = document.getElementById("from-account")
      if (fromAccountSelect && user.balance !== undefined) {
        const formattedBalance = user.balance.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
        fromAccountSelect.innerHTML = `<option value="checking">GCash Account - ₱${formattedBalance}</option>`
      }
    } catch (e) {
      console.error("Error parsing user data:", e)
    }
  }

  // Handle profile button click
  const profileBtn = document.getElementById("profile-btn")
  if (profileBtn) {
    profileBtn.addEventListener("click", () => {
      window.location.href = "dashboard.html"
    })
  }

  // Handle recipient account number input to auto-fetch recipient name
  const recipientAccountInput = document.getElementById("recipient-account")
  const recipientNameDisplay = document.getElementById("recipient-name-display")

  if (recipientAccountInput) {
    recipientAccountInput.addEventListener("blur", () => {
      const accountNumber = recipientAccountInput.value.trim()
      if (accountNumber) {
        // Fetch users to find the recipient
        fetch("/api/users")
          .then((response) => response.json())
          .then((data) => {
            if (data.success && data.users) {
              const recipient = data.users.find((u) => u.accountNumber === accountNumber)
              if (recipient && recipientNameDisplay) {
                recipientNameDisplay.textContent = recipient.name
                recipientNameDisplay.style.display = "block"
              } else if (recipientNameDisplay) {
                recipientNameDisplay.textContent = "Recipient not found"
                recipientNameDisplay.style.display = "block"
              }
            }
          })
          .catch((error) => {
            console.error("Error fetching users:", error)
          })
      } else if (recipientNameDisplay) {
        recipientNameDisplay.style.display = "none"
      }
    })
  }

  // Handle send money button
  const sendMoneyBtn = document.getElementById("send-money-btn")
  const amountInput = document.getElementById("amount")
  const noteInput = document.getElementById("note")
  const errorMessage = document.getElementById("error-message")
  const transactionCodeModal = document.getElementById("transaction-code-modal")

  if (sendMoneyBtn) {
    sendMoneyBtn.addEventListener("click", () => {
      // Validate inputs
      if (!recipientAccountInput.value) {
        errorMessage.textContent = "Please enter a recipient account number"
        errorMessage.style.display = "block"
        return
      }

      if (!amountInput.value || Number(amountInput.value) <= 0) {
        errorMessage.textContent = "Please enter a valid amount"
        errorMessage.style.display = "block"
        return
      }

      // Check if user has enough balance
      if (user && user.balance < Number(amountInput.value)) {
        errorMessage.textContent = "Insufficient funds"
        errorMessage.style.display = "block"
        return
      }

      // Show transaction code modal
      if (transactionCodeModal) {
        transactionCodeModal.classList.add("active")
      }
    })
  }

  // Handle confirm transaction button
  const confirmTransactionBtn = document.getElementById("confirm-transaction-btn")
  const transactionCodeInput = document.getElementById("transaction-code")
  const modalErrorMessage = document.getElementById("modal-error-message")

  if (confirmTransactionBtn) {
    confirmTransactionBtn.addEventListener("click", () => {
      // Validate transaction code
      if (!transactionCodeInput.value) {
        modalErrorMessage.textContent = "Please enter the transaction code"
        modalErrorMessage.style.display = "block"
        return
      }

      // Check if transaction code is correct (for demo purposes, we'll use a fixed code)
      if (transactionCodeInput.value !== "123678") {
        modalErrorMessage.textContent = "Invalid transaction code. Please try again."
        modalErrorMessage.style.display = "block"
        return
      }

      // Process the transaction
      const amount = Number(amountInput.value)
      const recipientAccount = recipientAccountInput.value
      const note = noteInput.value

      // Send transaction request to server
      fetch("/api/transactions/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderAccountNumber: user.accountNumber,
          recipientAccountNumber: recipientAccount,
          amount: amount,
          note: note,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Update user balance in localStorage
            user.balance -= amount
            localStorage.setItem("user", JSON.stringify(user))

            // Save transaction data for receipt
            localStorage.setItem("lastTransaction", JSON.stringify(data.transaction))

            // Redirect to confirmation page
            window.location.href = "confirmation.html"
          } else {
            // Hide modal
            transactionCodeModal.classList.remove("active")

            // Show error message
            errorMessage.textContent = data.message || "Transaction failed. Please try again."
            errorMessage.style.display = "block"
          }
        })
        .catch((error) => {
          console.error("Error:", error)

          // Hide modal
          transactionCodeModal.classList.remove("active")

          // Show error message
          errorMessage.textContent = "An error occurred. Please try again."
          errorMessage.style.display = "block"
        })
    })
  }

  // Handle bottom navigation
  const navItems = document.querySelectorAll(".nav-item")
  navItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      if (index === 0) {
        // Home
        window.location.href = "dashboard.html"
      } else if (index === 3) {
        // Transactions
        window.location.href = "transactions.html"
      } else {
        // Show coming soon modal for other nav items
        document.getElementById("coming-soon-modal").classList.add("active")
      }
    })
  })

  // Close coming soon modal
  const closeModalBtn = document.getElementById("close-modal-btn")
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
      document.getElementById("coming-soon-modal").classList.remove("active")
    })
  }
})
