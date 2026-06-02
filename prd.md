# Bourbon Trail Website PRD
My college new graduate friend group of 18 guys are going on a trip to the bourbon trail in Kentucky on August 21-23, 2026. We are creating a fun game out of it by splitting up into two teams of nine and having fun competitions against each other. The two team captains will be me (Andrew Lin) and Nick Dittemore where the team names are Team Lin and Team Ditty. Before the actual trip, we must determine the two teams. Everyone except the two captains will submit their team & teammate preferences, then the teams will be revealed in another weekend meetup, which we call "Alumni Retreat" happening on June 26 weekend. This website will serve as the place for everyone not a captain to submit their preference of team, as well as a general central location for all the information regarding the trip's "game".

## Tech stack
Use Next.js and Supabase PostgreSQL, hosted on vercel. This should be managed in a GitHub repository. For the UI, keep in mind most visits will be from an iPhone safari or chrome browser. Make it look simple and modern where it feels trustworthy, friendly, and effortless to use.

## Features
### Preference submission
Everyone not a captain should be able to submit a team preference form by answering the following questions:
* Do you want to package with other friends, and if so, who? 
  * If someone requests a package, the requestee(s) should receive an invite with an option to accept/decline. 
  * Upon acceptance, make note of it in the database. The team captains will place them on the same team. 
  * Upon decline, mark them as an individual. 
  * If more than two people are in a package request, but one person declines, the others should still be packaged together. 
* Do you prefer Team Lin, Team Ditty, or no preference?

In the case where a user already filled out their preference form but later receive a package request (and accepts it), override their initial submission data with whatever the package request contains. 

* Committee preference: everyone not a captain must be in a committee. Each committee does not necessarily have to be members of the same team. Rank your top 3 preference in order. 
  * Team lead, 1 per team (2 people)
  * Food (3 people)  
  * Instagram/pics (3)  
  * Venmo logging (2)  
  * Uber/lyft (3)  
  * Navigation & crowd control (3)

## Pages
There should be 2 non-public pages and 6 public pages. Make them accessible via a navbar. 
* Profile (each person's own personal profile)
* Admin (only accessible to the two team captains)
* Landing page
* Rosters 
* Score  
* Power Rankings   
* Spin the Wheel  
* Help

### Profile page (after logging in)
Personal profile page only accessible after logging in. Only the 18 of us should be able to log in, where each of us can edit our personal profile. Use Supabase Auth for the authentication. 
* If you'd like, I can gather the email addresses of each of our 18 people.
* If you ask for a password to log in, make sure it is encrypted in the database.  
* This page is where each of us (except captains) should fill out our team preference form. 
* When someone submits a package request, notify the requestee(s)'s profile. Allow them to accept/decline the package request. 
* After filling out the form, display their responses in their profile page and allow them to edit it if they change their mind. 
* Each person must select and answer two prompts to be displayed on the "Roster" page. They must select two prompts from the following bank:
  * Favorite bourbon
  * Nickname
  * Shotgun time
  * Rookie or Veteran?
  * Bench PR
  * Golf handicap
  * Predicted trip MVP? 
  * Favorite bar
  * Celebrity lookalike
  * Hidden talent
* Allow the user to enter their flight times (Friday arrival and Sunday departure) that is also to be displayed on the roster page. 

### Admin page
This page should only be accessible to the two captains, Andrew Lin and Nick Dittemore. Allow these actions:
* View all preference submissions
* View package requests
* Update power rankings

### Landing page
Note, these items are listed in the desired order of how they should be displayed. 
* Start with a countdown to Alumni Retreat at Kyle’s ranch. It will be June 27th, 2026 at 12pm CST.
* Itinerary of the distilleries we are visiting:
  * Friday August 21st (Louisville)
    * 4pm Old Forester
    * 9pm Whiskey Thief
  * Saturday August 22nd (Frankfort)
    * 10:30am Buffalo Trace
    * 1:30pm Glenn's Creek 
    * 3:15pm Woodford Reserve
  * Sunday August 23rd (Bardstown)
    * 10am Maker's Mark
    * 12:30pm Bardstown Bourbon
    * 2:15pm Heaven Hill
* Map of the distilleries we are visiting. Either Apple or Google maps view with pins at all the above distilleries. 

### Roster
Display all 18 players and their information entered in their profile. The 18 people are Andrew Lin, Nick Dittemore, Alan Marini, Brandon Turnage, Calvin Turrell, Eric McGonagle, Jackson David, Jacob Technik, Jess Holbert, Joseph Valenta, Juan Nerio, Juan Ardila, Kyle Dessens, Lucas Giammona, Nafi Islam, Nate Mathews, Nick Caso, and Scott Trouy.
For each person, their "player card" should contain the following:
* Headshot, which I still need to gather. Just use a filler image for now.
* Flight times: Each person should enter this in their profile page. Leave empty by default. 
* The two prompt responses answered in their profile page. Leave empty by default. 
* Some way of indicating whether they've submitted their team preference yet. 

### Scores
Display the live score between team Lin and team Ditty. Only the two captains and the team leads for each team should have admin privileges to increment the score.

Here are the point scoring opportunities. The value of each one is undecided as of now. 
* During the Alumni Retreat:
  * Bourbon related:
    * Blind tasting competition  
    * Proof guessing  
    * MSRP guessing  
  * Trivia night  
  * Beer olympics  
* During the trip:
  * Best distillery photo  
  * Most beers per day  
  * Pub golf  
  * Best gift shop purchase

### Power rankings
Display the current power ranking. These are determined by the two team captains. Right now, title it "Pre-season power rankings". These were determined by three criteria: MVP prediction, bourbon knowledge, and perceived aura. Here are the pre-season rankings in order:
1. Jackson David - jacksondavid2002@yahoo.com
2. Nick Dittemore - nickdittemo@gmail.com
3. Brandon Turnage - brandon.turnage03@gmail.com
4. Nate Mathews - Nathanielm001@gmail.com
5. Lucas Giammona - lucasmgiammona@gmail.com
6. Andrew Lin - andrew.mlin27@gmail.com
7. Calvin Turrell - calvin.turrell@gmail.com
8. Nick Caso - nickcaso32@gmail.com
9. Juan Nerio - Juanmnerio@gmail.com
10. Nafi Islam - nafi.islam321@gmail.com
11. Juan Ardila - Juancardila2@gmail.com
12. Eric McGonagle - ermcgonagle@gmail.com
13. Scott Trouy - Smct1118@gmail.com
14. Kyle Dessens - kyledessens@yahoo.com
15. Jacob Technik - jltechnik22@gmail.com
16. Joseph Valenta - Joseph.valenta5@gmail.com
17. Alan Marini - Alan.j.marini@gmail.com
18. Jess Holbert - Jessholbert37@gmail.com

### Spin the Wheel 
Throughout the trip, we will need to volunteer someone to do various tasks. Create a wheel with all 18 people's name on it. Upon a click, it should animate a spin and land on someone at random. 

Allow the user to customize who they want on the wheel before they spin. After the teams are determined, allow a functionality to easily customize the wheel to be only the members of the selected team. 

### Help page:
This page should be static display the information from rules.md. 



