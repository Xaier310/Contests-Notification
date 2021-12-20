# Contests-Notification
<h3>Telegram bot link : http://t.me/contestsNOTIFY_bot</h3>
<h3>It is a telegram bot which scrapes codechef contests details and notify users on there custom timings. I have also used gmail api by which it also notifies users through gmail on custom timings.</h3>


## Run Locally

Clone the project

```bash
  git clone https://github.com/Xaier310/Contests-Notification.git
```

Go to the project directory

```bash
  cd Contests-Notification
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  node Notifyme.js
```

<h3>Get Notifications for coding contests !!!!</h3><b>NOTE : </b>Till now we have only codechef notfication service available, we will add other platforms also<br><br><em>Some commands :</em><br>To get codechef notification : <br>/cc_addme<br><br>To stop notification of codechef : <br>/cc_removeme<br><br>To set timing ( like if you want notification 5 minutes before contest starts then use ) : <br>/cc_addtime 5min<br><br>To add multiple timings( Give timings seperated with space ) Like : <br>/cc_addtime 5min 2hr 3min<br><br>To remove your timing ( like you don't want notification before 5 minutes anymore then use ) : <br>/cc_removetime 5min<br><br>To remove multiple timings( Give timings seperated with space ) Like : <br>/cc_removetime 5min 2hr 7min<br><br>To get notifications on email as well then use : <br>/cc_addemail xyz@gmail.com<br><br>To remove email( If you don't want notification on email anymore ) : <br>/cc_removeemail<br><br>To see your timings, email & status : <br>/mydetails<br><br>To see codechef upcoming contests list : <br>/cc_upcomingcontests<br><br>To see this message again : <br>/help<br><br><br><b>Default setting :</b>You will get automatically notification 10 minutes before the contests starts and when contests starts. To costimize your timings use <br>/cc_addtime and /cc_removetime


## NOTE
Since heroku uses:- Dyno sleeping in which if an app has a free web dyno, and that dyno receives no web traffic in a 30-minute period, it will sleep. In addition to the web dyno sleeping, the worker dyno (if present) will also sleep. and if a sleeping web dyno receives web traffic, it will become active again after a short delay (assuming your account has free dyno hours available) You can use (http://kaffeine.herokuapp.com) to ping the heroku app every 30 minutes to prevent it from sleeping.


<h4>Some screenshots</h4>
1.
<img width="809" alt="Codechef notification 1" src="https://user-images.githubusercontent.com/83975334/139029205-800a1ad6-f741-49e1-9e74-fe922a2229e1.png">
2.
<img width="808" alt="Codechef notification 2" src="https://user-images.githubusercontent.com/83975334/139029693-7b75b769-3320-4b0c-9c94-35d46370328e.png">
3.
<img width="788" alt="Codechef notification 3" src="https://user-images.githubusercontent.com/83975334/139029700-c5963134-3cb8-4aa2-b90a-6f969b6dfdc3.png">

## Refrences
https://telegraf.js.org/ <br>
https://stackoverflow.com/
