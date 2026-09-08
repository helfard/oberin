# Instruction Manual for The Book of Observer

## Quick Overview

The Book of Observer is an auxiliary tool for Oberin created by me.

By scanning log files over any desired period, it can primarily do the following:

* Display the dates and times when skill levels or class levels increased.
* Display how many times a skill was used, succeeded, or failed when a skill level increased, along with its success rate.
* Display the total number of times each skill was used, succeeded, or failed, as well as its overall success rate.

This works on Google Chrome for Windows or Mac, but does not work on Firefox or Safari. It probably works on Microsoft Edge?

Also, **it will not work if the Logs folder is located inside a system folder**, so you must first tweak Oberin's `Config.cfg` to place the Logs folder outside of system directories.

Enjoy!

## Detailed Manual

The Book of Observer is a tool that reads Oberin log files and displays information.

By scanning log files for a specified period, it displays the dates and times when skill and class levels increased, along with their success rates.

It also outputs data on how much and in what ways you used those skills.

1. **Prerequisite: Edit Config.cfg**

    To use The Book of Observer, you must specify the Logs folder where log files are saved so the tool can access them.

    On both Windows and Mac, by default, **the Logs folder is located inside a system folder and cannot be accessed from the browser for security reasons**, so you first need to edit Oberin's `Config.cfg` file to change the location of the Logs folder.

    By default, the location of the Logs folder is:

    Windows: `C:\Users\[User Name]\AppData\Local\Oberin_BE\Logs`

    Mac: `/Users/[User Name]/Library/Application Support/Oberin_BE/Logs`

    (Note that `[User Name]` varies depending on the user.)

    Selecting `Oberin` from the game's menu bar and clicking `Open Default Config Directory` will open these default Oberin_BE folders.

    Open `Config.cfg` with an appropriate text editor like Notepad or TextEdit, and change this:

    > USE_OPTIONAL_PATH=0
    >
    > OPTIONAL_PATH=

    to this:

    > USE_OPTIONAL_PATH=1
    >
    > OPTIONAL_PATH= `[directory path]`

    Put the path of any desired folder into the `[directory path]` part. Create a folder with an appropriate name (such as `Oberin_BE`) anywhere you like—such as on your Desktop or in your Documents folder—and copy and paste that folder's path.

    On Windows, right-click the created folder and select "Copy as path". On Mac, Control-click the created folder, select "Get Info", and then Control-click the "Where" path in the window that appears to copy it (probably).

    After saving the edited `Config.cfg` file and restarting the game, a duplicate of the original `Config.cfg` will be created inside the folder you specified in `Config.cfg`.

    Restart the game, select `Oberin` from the menu bar, and choose `Open Optional Config Directory`. If the folder you just created opens, preparation is complete. If `Open Optional Config Directory` is grayed out and cannot be selected, you made a mistake somewhere along the way, so start over from the beginning.

    If things really don't work out, deleting the original `Config.cfg` file (the one inside the folder opened via `Open Default Config Directory`) and restarting the game will generate a fresh, default `Config.cfg` file, letting you reset everything.

1. **Prerequisite: Check Options Settings**

    Since this tool reads log files to do various things, it won't work if your settings aren't configured to save log files in the first place.

    Check the in-game menu bar under `Options` and ensure that `Enabled` under `Log Text` is checked.

    This should automatically create a new Logs folder in your designated directory, where log files will accumulate.

    By the way, whether `Split per character` is on or off doesn't matter, but you will need to specify later whether this setting is enabled or disabled.

1. **Register the Logs Folder and Configuring Settings**

    Once you've done this, click the "Select Folder" button in this tool.

    A folder selection screen will appear; specify the Logs folder located inside the directory you set up.

    Next, specify the date range for the log files you want to scan. Specifying an extremely past date and an extremely future date will effectively scan all log files in the Logs folder, but I haven't tested whether the tool can handle reading 365 days * 20 years = 7,300 files all at once.

    Additionally, specify the name of the character you want to scrutinize and whether `Logs are splited per name` is checked under `Log Text` in `Options`. If it's turned on, turn this on as well.

    Finally, choose whether to display additional analysis information. The items should be self-explanatory, but here is a brief explanation:

    * **Take/Catch**: Counts gathered items from Lumberjacking, Mining, and Fishing.
    * **Potion**: Counts potions made via Alchemy, or crafted products from Enchanting.
    * **Spell**: Counts spells cast via Magery.
    * **Reagent**: Counts reagents consumed in Alchemy and Magery.

    Once you have completed all of these steps, click the "Start Research" button at the end. Data will then be displayed in a neat list in the results section below.

## Side note

Because Blacksmithing, Tailoring, Tinkering, Woodcrafting, and some Enchanting do not leave distinguishable logs during crafting, the tool identifies which skill was used by looking at the tool equipped immediately beforehand. This should work as long as tools are automatically equipped upon using a skill, but be careful: if you deliberately equip a tool manually, it won't show up in the logs and will cause calculation errors.

Anatomy, Meditation, and Taming aggregate and display data that is likely meaningless in terms of skill experience, but this is intentional.

At present, Special/etc., Poisoning, Stealth, and Tracking are not supported. This is because I only own a Druid character, so I don't know what the logs for other classes' unique skills look like. I'll figure something out eventually.

This tool was created to investigate "how long did it take to level up?", and due to the author's personal policy, **it does not support "how much longer until the next level?"** (Though you can technically calculate that kind of thing from the displayed data, please do it manually). Skill levels are something that naturally go up on their own if you just casually play.

## Side note

I made this tool because the Fandom Oberin Wiki stated that "level 1 gathering skills only have a 10% success rate," but when I actually tried it, it was clearly at least 25%, so I wanted to gather proper data.

Personally, I'm not a fan of grindy gameplay focused purely on leveling skills, but that being said, I can understand the point of view of people who care about that sort of thing—so rather than keeping it entirely to myself, I figured it wouldn't hurt to release it to the public.

I hope this tool helps with your Oberin life. But go easy on the intense, grindy play sessions.