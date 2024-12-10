const emailSection = document.getElementById("emailSection");
const messagesSection = document.getElementById("messagesSection");
const generatedEmailElement = document.getElementById("generatedEmail");
const refreshMessagesButton = document.getElementById("refreshMessages");
const changeEmailButton = document.getElementById("changeEmail");
const messagesList = document.getElementById("messagesList");

let currentEmail = localStorage.getItem("currentEmail") || "";
const savedEmails = JSON.parse(localStorage.getItem("savedEmails")) || [];

const apiBaseURL = "https://www.1secmail.com/api/v1/";

// عند تحميل الصفحة، استرجاع الإيميل الحالي
if (currentEmail) {
  generatedEmailElement.textContent = currentEmail;
} else {
  generatedEmailElement.textContent = "لم يتم إنشاء إيميل بعد.";
}

// توليد إيميل جديد
const generateNewEmail = async () => {
  const response = await fetch(`${apiBaseURL}?action=genRandomMailbox&count=1`);
  const emails = await response.json();
  currentEmail = emails[0];
  localStorage.setItem("currentEmail", currentEmail);
  generatedEmailElement.textContent = currentEmail;

  // حفظ الإيميل في القائمة إذا لم يكن موجودًا
  if (!savedEmails.find((e) => e.email === currentEmail)) {
    savedEmails.push({ email: currentEmail, messages: [] });
    localStorage.setItem("savedEmails", JSON.stringify(savedEmails));
  }
};

// تحديث الرسائل
const refreshMessages = async () => {
  if (!currentEmail) return;

  const [login, domain] = currentEmail.split("@");
  const response = await fetch(`${apiBaseURL}?action=getMessages&login=${login}&domain=${domain}`);
  const messages = await response.json();

  messagesList.innerHTML = "";
  if (messages.length > 0) {
    for (const message of messages) {
      const fullMessage = await getFullMessage(login, domain, message.id);
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>من:</strong> ${fullMessage.from}<br>
        <strong>الموضوع:</strong> ${fullMessage.subject}<br>
        <strong>النص:</strong> ${fullMessage.body || "بدون محتوى"}
      `;
      messagesList.appendChild(li);

      // تحديث الرسائل المحفوظة
      const emailData = savedEmails.find((e) => e.email === currentEmail);
      if (emailData) {
        emailData.messages = messages;
        localStorage.setItem("savedEmails", JSON.stringify(savedEmails));
      }
    }
    messagesSection.classList.remove("hidden");
  } else {
    messagesSection.classList.add("hidden");
    alert("لا توجد رسائل جديدة.");
  }
};

// جلب نص الرسالة الكامل
const getFullMessage = async (login, domain, messageId) => {
  const response = await fetch(
    `${apiBaseURL}?action=readMessage&login=${login}&domain=${domain}&id=${messageId}`
  );
  const data = await response.json();
  return {
    from: data.from,
    subject: data.subject,
    body: data.textBody || data.htmlBody || "بدون محتوى",
  };
};

// عند الضغط على زر "تحديث الرسائل"
refreshMessagesButton.addEventListener("click", refreshMessages);

// عند الضغط على زر "تغيير الإيميل"
changeEmailButton.addEventListener("click", async () => {
  if (confirm("هل تريد تغيير الإيميل؟ سيتم حذف الإيميل الحالي.")) {
    localStorage.removeItem("currentEmail");
    currentEmail = "";
    generatedEmailElement.textContent = "لم يتم إنشاء إيميل بعد.";
    messagesList.innerHTML = "";
    messagesSection.classList.add("hidden");
    await generateNewEmail();
  }
});

// توليد إيميل عند فتح الصفحة إذا لم يكن هناك إيميل
if (!currentEmail) {
  generateNewEmail();
}
