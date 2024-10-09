const API_URL = "http://localhost:5000/api"; // Replace with your actual backend URL
let token = ""; // To store the JWT

// Function to handle user registration
document
  .getElementById("signup-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;
    console.log(username, password, role);

    const response = await fetch(`${API_URL}/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, pass: password, role }),
    });

    const data = await response.json();
    if (response.status === 201) {
      alert("Registration successful! You can now log in.");
      token = data.token; // Store the token
      localStorage.setItem("token", token); // Store token in local storage
      window.location.href = "dashboard.html"; // Redirect to login page
    } else {
      alert(data.message || "Registration failed");
    }
  });

function handleLogin() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  console.log(username, password);

  fetch(`${API_URL}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, pass: password }),
  })
    .then((response) => {
      return response.json().then((data) => {
        return { status: response.status, data };
      });
    })
    .then(({ status, data }) => {
      if (status === 200) {
        token = data.token; // Store the token
        localStorage.setItem("token", token); // Store token in local storage
        window.location.href = "dashboard.html"; // Redirect to dashboard
      } else {
        alert(data.message || "Login failed");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("An error occurred during login. Please try again.");
    });
}

// Function to load all members
async function loadMembers() {
  const response = await fetch(`${API_URL}/librarian`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  const memberList = document.getElementById("member-list");
  memberList.innerHTML = ""; // Clear existing entries

  if (response.ok) {
    data.members.forEach((member) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${member.username}</td>
                <td>
                    <button onclick="removeMember('${member._id}')" class="btn btn-danger btn-sm">Remove</button>
                </td>
            `;
      memberList.appendChild(row);
    });
  } else {
    alert(data.message || "Failed to load members");
  }
}

// Function to remove a member
async function removeMember(memberId) {
  const response = await fetch(`${API_URL}/librarian/${memberId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  if (response.ok) {
    alert("Member removed successfully!");
    loadMembers(); // Reload the member list
  } else {
    alert(data.message || "Failed to remove member");
  }
}

// Add Book Functionality
document
  .getElementById("add-book-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const bookTitle = document.getElementById("book-title").value;
    const bookAuthor = document.getElementById("book-author").value;
    const bookStatus = document.getElementById("book-status").value;

    console.log(bookTitle, bookAuthor, bookStatus);

    const response = await fetch(`${API_URL}/librarian/add`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: bookTitle,
        author: bookAuthor,
        status: bookStatus,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      alert("Book added successfully!");
      loadBooks(); // Reload the book list
    } else {
      alert(data.message || "Failed to add book");
    }
  });

// Load Books
async function loadBooks() {
  const response = await fetch(`${API_URL}/members`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  const bookList = document.getElementById("book-list");
  bookList.innerHTML = ""; // Clear existing entries

  if (response.ok) {
    data.books.forEach((book) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.status}</td>
                <td>
                    <button onclick="deleteBook('${book._id}')" class="btn btn-danger btn-sm">Delete</button>
                </td>
            `;
      bookList.appendChild(row);
    });
  } else {
    alert(data.message || "Failed to load books");
  }
}

// Delete Book Functionality
async function deleteBook(bookId) {
  const response = await fetch(`${API_URL}/librarian/remove/${bookId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  if (response.ok) {
    alert("Book deleted successfully!");
    loadBooks(); // Reload the book list
  } else {
    alert(data.message || "Failed to delete book");
  }
}

// Handle Borrow/Return
document
  .getElementById("borrow-return-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const bookId = document.getElementById("book-title").value; // Assuming book title is used
    const action = document.getElementById("action").value;

    const response = await fetch(
      `${API_URL}/members/${action.toLowerCase()}/${bookId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    if (response.ok) {
      alert(`Book ${action.toLowerCase()}ed successfully!`);
      loadHistory(); // Reload history
    } else {
      alert(data.message || "Failed to process request");
    }
  });

// Load Borrow/Return History
async function loadHistory() {
  const response = await fetch(`${API_URL}/members/history`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  const historyList = document.getElementById("borrow-return-history");
  historyList.innerHTML = ""; // Clear existing entries

  if (response.ok) {
    data.history.forEach((record) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${record.bookTitle}</td>
                <td>${record.action}</td>
                <td>${new Date(record.date).toLocaleDateString()}</td>
            `;
      historyList.appendChild(row);
    });
  } else {
    alert(data.message || "Failed to load history");
  }
}

// Retrieve token on page load
document.addEventListener("DOMContentLoaded", () => {
  token = localStorage.getItem("token"); // Assuming token is stored in local storage
  if (token) {
    loadBooks(); // Load books if token is available
    loadHistory(); // Load history if token is available
    loadMembers(); // Load members if token is available
  }
});

function restrictAccess(role) {
  const librarianOnlyLinks = document.querySelectorAll(".librarian-only");

  if (role === "user") {
    librarianOnlyLinks.forEach((link) => {
      link.style.display = "none"; // Hide librarian-only links
    });

    // Add click event to restricted links
    const restrictedLinks = document.querySelectorAll(".restricted");
    restrictedLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent navigation
        alert("Only librarians can access this route."); // Show alert
      });
    });
  }
}
