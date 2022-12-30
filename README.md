# Apps Script Cal Sync

A utility to perform a one-way sync from one or multiple calendars into one sync target.

With this utility you can easily set up a system like the below:

```
+-----------------------+
| Work Cal              | ->-\
+-----------------------+     \
                               \
+-----------------------+       \
| Community Events Cal  | ->-----\
+-----------------------+         \             +--------------+
                                   --------->   | Personal Cal |
+-----------------------+         /             +--------------+
| School Cal            | ->-----/
+-----------------------+       /
                               /
+-----------------------+     /
| Corporate Cal         | ->-/
+-----------------------+
```

Situations in which this might be useful:

- If you base your availability on various calendars, and would like to share your events with someone (i.e. a partner), but don't want to give them access to all the calendars. You can sync all the events to a single calendar and share that with them.
- If you have some automated actions associated with calendar events, but again, want the actions to happen for multiple calendars without having to set up permissions for all calendars.

## Installation

This is an [Apps Script project](https://developers.google.com/apps-script/guides/projects), which means that you'll have to set up your own project on your own account.

You'll also need to make sure that your account has at least read-only access to every source calendar.

You have two options for instllation, the developer friendly version, and the non-developer friendly version.

## Non-developer-friendly installation

1. Navigate to your [Google Drive](https://drive.google.com/drive/my-drive) or [Apps Script home](https://script.google.com/home)
2. Create new [standalone Apps Script project](https://developers.google.com/apps-script/guides/standalone)
3. [Create a new file](https://developers.google.com/apps-script/guides/projects#create_a_file) for each file in the (`dist`)[/dist] folder and manually copy and paste the code from one into the other.
4. Create a `!Config` file. This file must be first in the alphabetical sort order of files, hence the exclamation point `!` in the file name.
5. Set up your [triggers](#triggers)

Note that at some point you'll be asked to grant the project permissions.

## Developer-friendly installation

Additionally, since this project is written in TypeScript, you'll need to install a few things locally to be able to compile the code:

- Git
- Node
- Clasp (`npm install -g @google/clasp`)

With these programs installed, follow these instructions on the command line:

1. Clone this Git repository locally and `cd` into it
2. Install npm dependencies `npm i`
3. In your browser:
   - Navigate to your Goolge Drive or Apps Script home
   - Create new standalone Apps Script project
   - Take a note of the script ID
4. Back in the CLI, clone the newly created script `clasp clone <SCRIPT_ID>`. This will mess with the project files locally---that's expected---move on to the next step.
5. Reset the Git repo `git reset --hard` to restore the project files
6. Create a `!Config.ts` file in the `src` folder. This file must be first in the alphabetical sort order of files, hence the exclamation point `!` in the file name.
7. Input your [configuration](#configuration)
8. Upload the config file with `clasp push`
9. Set up your [triggers](#triggers)

Note that at some point you'll be asked to grant the project permissions.

## Configuration

The config file should contain at least:

```js
// !Config.ts

const CFG = {
  SOURCES: {
    "[S]": "your_source@your_domain.com",
  },
  MERGE_TARGET: "your_sync_target@your_domain.com",
  DAYS_INTO_PAST: 7,
  DAYS_INTO_FUTURE: 14,
};
```

You can add multiple sources. The value on the left `[S]` will be prepended to all the events created in the target calendar.

## Triggers

You can run the initial sync manually by running the `main()` function. Yet you'll want a way for this to run automagically.

For this, Apps Script has triggers. You'll want to install a [time-driven trigger](https://developers.google.com/apps-script/guides/triggers/installable#time-driven_triggers) and a few [event-driven triggers](https://developers.google.com/apps-script/guides/triggers/installable#event-driven_triggers).

To install the time-driven trigger, in your Apps Script project, click on the clock icon in the left sidebar, and then push the _+ Add Trigger_ button in the bottom left. From there choose the `main` function, the _Head_ deployment (default), and from there choose settings that make sense for you.

To install the event-driven triggers, which will run whenever there is a change in the source calendars (only works for personal calendars---ones with the user's email as the calendar ID), run the `refreshCalendarTriggers` function in the `Triggers` script file. This will delete all existing Calendar triggers and create new ones based on the config file. Run this whenever you modify the sources in your configuration file.

## How it Works

The process to sync events is as follows:

1. Get all events that have been created by this script from the target calendar. How does it know which ones? With the [sync metadata](#sync-metadata)
2. For each calendar in the sources:
   - For events in source but not target: create events in target
   - For events in source and target: update in target if have been updates since last sync, or else skip
   - For events not in source but in target: delete in target

This process relies on the [sync metadata](#sync-metadata).

### Sync Metadata

In each event created by this script, in the description of the event you'll see some text added to the original description. This is what the script uses to be able to perform a safe and efficient sync.

If you delete these lines, these events will just end up being invisible to the script and you'll end up with a duplicate event in your sync target.
