const savedEmailsList = document.getElementById("savedEmailsList");
const savedEmails = JSON.parse(localStorage.getItem("savedEmails")) || [];

// عرض الإيميلات المحفوظة
savedEmails.forEach((emailData) => {
  const li = document.createElement("li");
  li.innerHTML = `<strong>${emailData.email}</strong><ul>${emailData.messages.map(
    (msg) => `<li>من: ${msg.from} - الموضوع: ${msg.subject}</li>`
  ).join("")}</ul>`;
  savedEmailsList.appendChild(li);
});