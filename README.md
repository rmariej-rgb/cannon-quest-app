# The Canon Quest — iOS App

This is a Capacitor-wrapped version of The Canon Quest, ready to be built into
a real iOS app via Codemagic (no Mac required on your end).

Your reading data is now stored using **Capacitor Preferences**, which writes
to real native local storage on your phone — not tied to any browser, and not
cleared by cache-clearing or the 7-day Safari storage limit.

---

## Part 1 — Get this code onto GitHub

### 1. Create the repository
1. Go to [github.com/new](https://github.com/new)
2. Name it something like `canon-quest-app`
3. Leave it **empty** (no README/gitignore — we already have ours)
4. Click **Create repository**. Keep this page open — it shows the commands
   you'll need, which look like the ones below.

### 2. Push this project
Open a terminal in this project folder and run, one line at a time:

```bash
git init
git add .
git commit -m "Initial commit: Canon Quest iOS app"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/canon-quest-app.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your actual GitHub username. If it's your first
time pushing from this machine, GitHub will prompt you to log in (browser
popup or a personal access token — just follow its prompts).

### 3. Future updates
Any time you or I change the code:
```bash
git add .
git commit -m "describe what changed"
git push
```
That's the whole workflow — edit, add, commit, push.

---

## Part 2 — Apple Developer account

1. Go to [developer.apple.com/programs](https://developer.apple.com/programs)
2. Enroll — $99/year, needs a valid ID and takes Apple ~24-48h to approve
   (usually faster)
3. Once approved, you'll have access to **App Store Connect**
   (appstoreconnect.apple.com), where you'll eventually create the app
   listing and manage TestFlight

---

## Part 3 — Codemagic (the cloud Mac that builds your app)

### 1. Sign up
Go to [codemagic.io](https://codemagic.io) → sign up with your GitHub account
directly — this lets Codemagic see your repos without extra setup.

### 2. Connect the repo
- Add `canon-quest-app` as a new app in Codemagic
- It will detect the `codemagic.yaml` file already in this project and use it
  automatically

### 3. Connect your Apple account (one-time setup)
Codemagic needs an **App Store Connect API key** to sign builds on your
behalf:
1. In App Store Connect: **Users and Access → Integrations → App Store
   Connect API** → generate a new key (role: App Manager)
2. Download the `.p8` key file it gives you (only downloadable once — save it)
3. In Codemagic: **Team settings → Integrations → App Store Connect** →
   paste in the Issuer ID, Key ID, and upload the `.p8` file
4. Create an environment variable group in Codemagic called `ios_signing`
   (matches the name in `codemagic.yaml`) and link this integration to it

Codemagic has a setup wizard for this exact flow — it's more click-through
than typing.

### 4. First build
- In Codemagic, hit **Start new build** on the `ios-canon-quest` workflow
- It spins up a cloud Mac, runs `npm install`, builds the web app, syncs
  Capacitor, builds and signs the iOS app, and — per the config — uploads it
  straight to **TestFlight**
- Takes roughly 10–20 minutes the first time

### 5. Install it on your phone
1. Download **TestFlight** from the App Store (Apple's own testing app)
2. Once your build finishes processing in App Store Connect (~5–10 min after
   upload), you'll get access via TestFlight
3. Open TestFlight on your phone → install **The Canon Quest** → it's now a
   real app icon on your home screen, backed by native local storage

---

## Making changes later

1. Ask me to make the change, or edit the code yourself
2. `git add . && git commit -m "..." && git push`
3. Trigger a new build in Codemagic (or set up auto-builds on push, which
   Codemagic supports in its workflow settings)
4. New version shows up in TestFlight in ~15 minutes

---

## Going fully public on the App Store (optional, later)

Everything above gets you the app on your own phone via TestFlight. To list
it publicly:
1. Create the app listing in App Store Connect (icon, screenshots,
   description, privacy info)
2. Change `submit_to_testflight: true` in `codemagic.yaml` to also submit for
   App Store review, or do it manually from App Store Connect
3. Apple review typically takes 1–3 days

No rush on this — TestFlight alone gives you a real installed app with full
native storage, which was the original goal.
