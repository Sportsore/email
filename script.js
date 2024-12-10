const generateEmailButton = document.getElementById("generateEmail");
const emailSection = document.getElementById("emailSection");
const messagesSection = document.getElementById("messagesSection");
const generatedEmailElement = document.getElementById("generatedEmail");
const refreshMessagesButton = document.getElementById("refreshMessages");
const messagesList = document.getElementById("messagesList");

let currentEmail = "";
let savedEmails = JSON.parse(localStorage.getItem("savedEmails")) || [];

const apiBaseURL = "https://www.1secmail.com/api/v1/";

// جلب إيميل جديد
generateEmailButton.addEventListener("click", async () => {
  const response = await fetch(`${apiBaseURL}?action=genRandomMailbox&count=1`);
  const emails = await response.json();
  currentEmail = emails[0];
  generatedEmailElement.textContent = currentEmail;
  emailSection.classList.remove("hidden");
  messagesSection.classList.add("hidden");

  if (!savedEmails.find((e) => e.email === currentEmail)) {
    savedEmails.push({ email: currentEmail, messages: [] });
    localStorage.setItem("savedEmails", JSON.stringify(savedEmails));
  }
});

// تحديث الرسائل
refreshMessagesButton.addEventListener("click", async () => {
  if (!currentEmail) return;

  const [login, domain] = currentEmail.split("@");
  const response = await fetch(`${apiBaseURL}?action=getMessages&login=${login}&domain=${domain}`);
  const messages = await response.json();

  messagesList.innerHTML = "";
  if (messages.length > 0) {
    messages.forEach((message) => {
      const li = document.createElement("li");
      li.textContent = `من: ${message.from} - الموضوع: ${message.subject}`;
      messagesList.appendChild(li);
    });
    messagesSection.classList.remove("hidden");

    // تحديث الرسائل المحفوظة
    const emailData = savedEmails.find((e) => e.email === currentEmail);
    if (emailData) {
      emailData.messages = messages;
      localStorage.setItem("savedEmails", JSON.stringify(savedEmails));
    }
  } else {
    messagesSection.classList.add("hidden");
    alert("لا توجد رسائل جديدة.");
  }
});