# Instruction Manual for The Book of Wanderer

## Quick Overview

The Book of Wanderer is a companion tool I created for Oberin.

By reading Oberin's log files, it primarily allows you to:

* Display Sextant and Orb of Seeing coordinates on the map.
* Organize text logs (purposed so that you can have an AI translate the organized logs).

It works on Google Chrome for Windows or Mac, but does not work on Firefox or Safari. Microsoft Edge probably works?

Also, **it will not work if the Logs folder is located inside a system folder**, so you must first tweak Oberin's `Config.cfg` to place the Logs folder outside of system directories.

Enjoy!

## Detailed Manual

The Book of Wanderer is a tool that reads Oberin's log files and displays information.

In addition to displaying Sextant and Orb of Seeing coordinates on a map, it cleanly organizes text logs. The idea is that you can have the browser's built-in AI translate the organized text logs for a smooth experience (though, as of right now, Google Chrome's built-in Gemini is completely unreliable and doesn't quite work the way I envisioned).

1. **Preparation: Edit Config.cfg**

    To use The Book of Wanderer, you need to specify the Logs folder where log files are saved so the tool can open them.
    On both Windows and Mac, the **Logs folder is located inside a system folder by default and cannot be accessed from the browser due to security reasons**, so you first need to edit Oberin's `Config.cfg` file to change the location of the Logs folder.

    By default, the location of the Logs folder is:

    Windows: `C:\Users\[User Name]\AppData\Local\Oberin_BE\Logs`

    Mac: `/Users/[User Name]/Library/Application Support/Oberin_BE/Logs`

    (Note that `[User Name]` varies depending on the user.)

    Selecting `Open Default Config Directory` from `Oberin` in the game's menu bar will open these default `Oberin_BE` folders.

    Open `Config.cfg` with a suitable text editor like Notepad or TextEdit, and change this:

    > USE_OPTIONAL_PATH=0
    >
    > OPTIONAL_PATH=

    to this:

    > USE_OPTIONAL_PATH=1
    >
    > OPTIONAL_PATH= `[directory path]`

    For the `[directory path]` part, enter the path of any folder you like. Create a folder with an appropriate name (e.g., `Oberin_BE`) in any location you prefer—such as your Desktop or Documents folder—and copy and paste that folder's path.

    On Windows, right-click the created folder and select "Copy as path"; on Mac, Control-click the created folder, select "Get Info", and then Control-click the "Where" path in the resulting window to copy the folder's path (probably).
   
    After saving the edited `Config.cfg` file and restarting the game, a duplicate of the original `Config.cfg` will be created inside the folder you specified in `Config.cfg`.

    Restart the game, select `Open Optional Config Directory` from `Oberin` in the menu bar, and if the folder you just created opens, preparation is complete. If `Open Optional Config Directory` is grayed out and cannot be selected, you made a mistake somewhere along the way, so start over from the beginning.

    If things just won't work out, deleting the original `Config.cfg` file (i.e., the one inside the folder opened via `Open Default Config Directory`) and restarting the game will generate a fresh, default `Config.cfg` file, resetting everything.

2. **Preparation: Check Options Settings**

    Since this tool reads log files to do various things, it won't work unless the game is set to save log files in the first place.

    Make sure that `Enabled` under `Log Text` is checked from `Options` in the in-game menu bar.

    This should automatically create a new Logs folder in the designated directory, where log files will accumulate.

    By the way, whether `Split per character` is on or off doesn't cause any issues. Probably.

3. **Register the Logs Folder**

    Once you've done this, click the "Select Folder" button in this tool.

    A folder selection screen will appear; specify the Logs folder located inside your designated directory. It will automatically detect and monitor the latest log file, and once it successfully reads the log, the read logs will appear under "Text Log."

    In the current version of Oberin, log files are written out every 90 seconds, but this tool checks for log file updates every 10 seconds. In other words, log updates will be reflected in the tool anywhere from a minimum of 10 seconds to a maximum of 100 seconds after doing something in-game.

4. **Display Sextant/Orb Coordinates and the World Map**

    If there are Sextant or Orb of Seeing coordinates in the loaded logs, those points will be displayed on the map. Additionally, the map surrounding the location where the Sextant was used will be revealed.

    There are two things to note here. First, the relative coordinates of the Orb of Seeing are converted to absolute coordinates by factoring in the coordinates of the Sextant used immediately prior, so you must always use a Sextant before using an Orb of Seeing, otherwise it might display crazy coordinates.

    Also, to prevent excessive spoilers for beginners, the map only reveals the area around **Sextant** coordinates. To display the entire world, you'll need to walk all over the place with an Orb in hand.

    By the way, the base map for this tool is a slightly older version of the world map released by GM Bobley around 2024–2025, so it probably lacks some (or all?) of the new areas added since 2024.

5. **Organize Logs**

    Under Text Logs section, you'll see logs that have been read and organized by this tool.

    Browsers that support this tool, such as Google Chrome, feature AI integration functions that let you consult with AI about the content of the site you are browsing. In Chrome's case, that's the "Ask Gemini" button at the top. Therefore, having the AI translate the logs detected and organized by this tool should allow for efficient translation... or so is the theory, but feel free to try it out yourself to see how it actually feels. To give my personal impression, it's currently at a "poorly made toy" level. It's hard to call it practical...

    Since this AI translation cannot be set to repeat automatically, the player must manually send a signal to the AI to start translation once a certain amount of logs have accumulated. With the default instructions, just typing `.` will trigger the AI.

    Also, since longer translation logs increase the load on the AI, hit the "Clear Logs" button at appropriate intervals to clean up the accumulated logs.

6. **Automatic Translator (Japanese Version Only)**

    The AI translation written above is a useless fellow that won't work unless manually instructed by the player (and frequently fails to follow instructions even when given), but Google Chrome also has a separate Built-in AI feature. You can use it to automatically translate the loaded logs, so I went ahead and implemented it as an extra. **It downloads a huge amount of data only on the first run**, so please wait a moment.

    While this runs completely locally, the AI's performance is quite low, and the translation accuracy is... well, let's just say it leaves a lot to be desired. Things rarely go entirely as you hope.

    By the way, this feature is only available in the Japanese version. This is because attempting to implement this feature in the English version would require translating romaji Japanese into English, but the Built-in AI's performance is too low to convert romaji Japanese into regular Japanese (or rather, it can't even distinguish which text is romaji Japanese and which is English in the first place).

7. **Manual Translator (Japanese Version Only)**

    This is an English translation feature using the Built-in AI. In other words, if you enter Japanese text in the upper text box and press the "Translate" button, the English translation appears in the lower text box. Is the translation accuracy usable enough for playing Oberin? It's passable, I suppose?

    However, since Oberin currently lacks a copy-paste function, having to look at this and type it out yourself is super tedious. Help me, Bobley!

## Frequently Asked Questions

Q. **I want to display the entire map!**

A. **There is no such convenient cheat code! (^_^)**

Even if you are a super veteran who knows current Oberin from end to end, there is no catering feature to fully reveal the map by default. If you want to display the entire world map, do your best to travel the world and use Sextants everywhere.

By the way, using a Sextant at the edges on the four corners of the world gives higher priority to retaining coordinate data for map revelation than other coordinates.


Q. **The Gemini guy on the sidebar isn't translating properly...?**

A. **The same to me! (^_^)**

Copy-pasting the entire Text Logs section and dumping it directly into the AI works better, and I honestly wish something could be done about that. Help me, Google!

## Side note

It was over 20 years ago, but I used to make a tool called "HAIKAI." You would input the coordinates of Oberin's Sextant or Orb of Seeing, and it would display roughly where the target was on a world map. If you ran it periodically, ~~stalking someone you were interested in became a breeze~~ it was useful for figuring out where you currently were, and I thought it turned out pretty well, though I'm not sure how widely recognized it was.

I also made a tool called "HAIKAI Dash." This was a Dashboard Widget version of the web app HAIKAI, and it took advantage of being a local application to automatically read log files upon startup, eliminating the hassle of manually entering coordinates—making it extremely convenient. At the time, I fondly thought to myself, "I really made something great..."

After that, various things happened, and I retired from Oberin once, leaving HAIKAI and HAIKAI Dash abandoned. By around 2020 at the latest, the free web hosting services where these tools were hosted had shut down, and the tools became unusable.

Around the time Oberin went multi-platform in 2026, I happened to step back into this world, and that's when I remembered HAIKAI. No source code from back then survived, but I built it myself once before, and it wasn't doing anything all that complicated anyway. For some reason, there are no tools of that kind around these days (when I made HAIKAI, there were at least two similar tools), so since that's the case, I figured it wouldn't hurt to make it all over again.

Modern web apps apparently can read local files. Utilizing this makes it possible to equip a web app like the original HAIKAI with the auto-log-reading feature that HAIKAI Dash had. Since I'm reading log files, there are a few other things I'd like to do while I'm at it, so why not incorporate them all at once?

That's the background of how I started development on the new HAIKAI. Nowadays, you can just instruct an AI and it whips things up smartly, which is great since it saves manual labor. Since this time it's no longer just HAIKAI's original function (i.e., displaying coordinate data on a map), I might as well give it a new name.

Thus appeared the "The book of Wanderer" you are looking at right now. The codename during development was HAIKAI Turbo. After the original and Dash, Turbo is only natural, right?

Currently, this tool hasn't reached the performance level I envisioned, but that should sort itself out gradually as the performance of the cooperating AI improves. With that said, I've decided to officially release it.

I hope this tool helps you on your journey.