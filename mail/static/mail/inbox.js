document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-form').addEventListener('submit', send_mail);
  // By default, load the inbox
  load_mailbox('inbox');



});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector("#email-view").style.display = "none"


  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector("#email-view").style.display = "none";

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      // Print emails
      console.log(emails);

      emails.forEach(email => {
        const element = document.createElement('div');
        element.setAttribute('class', 'emails_card');
        element.style.backgroundColor = "white"
        if (email.read === true) {
          element.style.color = "white"
          element.style.backgroundColor = "gray";
        }
        else {
          element.style.color = "black"
          element.style.backgroundColor = "white";
        }
        element.innerHTML =
          `<span class="sender">${email.sender}</span>
        <span class="subject">${email.subject}</span>
        <span class="timestamp">${email.timestamp}</span>
        `
          ;
        element.addEventListener('click', function () {
          console.log('This element has been clicked!')
          document.querySelector("#emails-view").style.display = "none";
          document.querySelector("#email-view").style.display = "block"

          // sending an GET request to API for email content

          fetch(`/emails/${email.id}`)
            .then(response => response.json())
            .then(email => {
              // Print email
              console.log(email);

              // display the email on the page
              document.querySelector("#email-view").innerHTML =
                `
              <hr><br>
              <p><strong>From: </strong>${email.sender}</p>
              <p><strong>To: </strong>${email.recipients}</p>
              <p><strong>Subject: </strong>${email.subject}</p>
              <p><strong>Timestamp: </strong>${email.timestamp}</p>
              <button class="btn btn-sm btn-outline-primary" id="reply_btn">Reply</button>
              <br><hr><br>
              <p>${email.body}</p>
              <br><hr><br><hr>
              `;

              // Reply Logic
              document.querySelector("#reply_btn").addEventListener("click", () => {
                document.querySelector("#email-view").style.display = "none";
                document.querySelector("#compose-view").style.display = "block";

                document.querySelector("#compose-recipients").value = email.sender;
                let check_re = document.querySelector("#compose-subject").value
                if (check_re.split(" ", 1)[0] != "Re:") {
                  document.querySelector("#compose-subject").value = `Re: ${email.subject}`; 
                }
                else {
                  document.querySelector("#compose-subject").value = `${email.subject}`;
                }
                document.querySelector("#compose-body").value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;

              })
              if (mailbox !== "sent") {
                const arc_btn = document.createElement("button");
                arc_btn.innerHTML = email.archived ? "Unarchive" : "Archive";
                arc_btn.setAttribute("class", "btn btn-sm btn-outline-primary");
                arc_btn.style.float = "left";
                arc_btn.addEventListener("click", () => {
                  console.log("Arc Button")
                  // Archive Logic
                    fetch(`/emails/${email.id}`, {
                      method: 'PUT',
                      body: JSON.stringify({
                        archived: !email.archived
                      })
                      
                    })
                    .then(() => load_mailbox("inbox"))
                  
                })
                document.querySelector("#email-view").append(arc_btn)
              }

            });
          // sending a PUT request to mark read current email
          if (!email.read) {
            fetch(`/emails/${email.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                read: true
              })
            })
          }
        });
        document.querySelector('#emails-view').append(element);
      });
    });
}


function send_mail(event) {
  event.preventDefault();

  console.log('Hello world');

  // Take all fields to compose mail
  const recipients = document.querySelector("#compose-recipients").value
  const subject = document.querySelector("#compose-subject").value
  const body = document.querySelector("#compose-body").value

  // fetch reuquest

  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body,
    })
  })
    .then(response => response.json())
    .then(result => {
      //Print result
      console.log(result);
      load_mailbox('sent')
    })
}


function reply_view() {
  doument
}