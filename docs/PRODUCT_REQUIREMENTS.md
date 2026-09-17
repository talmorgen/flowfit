# FlowFit Product Requirements

## Product definition

FlowFit is a surf-first adaptive training coach. It protects the user's long-term strength progress and a minimum of one weekly run while allowing surf conditions and planned surf sessions to take priority. It learns from completed workouts, Garmin activity and recovery data, and in-workout feedback to continuously adjust the plan.

## Primary outcome

Help the user make the best training decision today and tomorrow without manually rebuilding the week:

1. Surf when worthwhile waves are available or a surf session is planned.
2. Complete enough strength work to improve consistently without interfering with surfing.
3. Run at least once per rolling seven days.
4. Use swimming or recovery work when it is the best fit.
5. Detect progress, stagnation, fatigue, or imbalance and adapt exercises, volume, repetitions, and weights.

## Product principles

- **Surf first, goals protected:** planned or detected surfing reshapes the week; it does not erase strength and running goals.
- **Plan the week, decide the day:** the app maintains a flexible seven-day plan and gives one clear recommendation for today and tomorrow.
- **Evidence before adaptation:** recommendations explain which recent activity, recovery signal, performance trend, or forecast caused a change.
- **Low-interaction gym mode:** the coach speaks through earphones; the user responds using large buttons or short typed input, not voice.
- **Progress over novelty:** exercise changes happen only for plateau, pain, equipment constraints, imbalance, or a deliberate training phase.
- **User stays in control:** suggestions never start, record, or permanently alter a program without confirmation.

## Core user loop

### 1. Weekly planning

The user can mark any future day as planned surfing, running, swimming, strength, unavailable, or undecided. The planner also shows the Beit Yanai wave forecast. A planned session is provisional until completed.

Garmin synchronization can later confirm an activity. A detected surf replaces the provisional surf plan; an unplanned activity triggers recalculation of the remaining week.

The planner must preserve:

- the user's preferred surf opportunities;
- at least one run in every rolling seven-day window;
- the configurable strength-session target;
- recovery spacing between demanding leg sessions, runs, and surf sessions.

### 2. Today and tomorrow

The home view shows one recommended action for today and one provisional recommendation for tomorrow. Each recommendation includes:

- activity and, for strength, the exact program;
- expected duration and intensity;
- the reason for the recommendation;
- any change from the base program;
- actions to accept, adjust, defer, or ask the coach.

The user can tell the coach about a future surf session in natural language or through the weekly planner, for example: “I plan to surf Friday morning.”

### 3. Strength workout coaching

After a strength workout starts, the coach becomes a hands-free narrator. It announces the current exercise, target weight/repetitions, key technique cue, completed-set summary, rest countdown milestones, and the next exercise.

The user responds with large controls:

- set completed;
- easier than expected;
- on target;
- too hard;
- pain or discomfort;
- repeat, skip, substitute, or type a note.

The coach can adapt remaining sets, weight, repetitions, rest time, exercise order, or substitute an exercise. Material program changes require a short explanation and confirmation.

Every set is persisted immediately with date/time, exercise, set number, weight, repetitions, RPE/difficulty, notes, and adaptation source so the workout can resume after leaving the app.

### 4. Progress and adaptation

The Progress view answers four questions:

1. Am I getting stronger?
2. Am I training consistently?
3. Which exercises or movement patterns have stalled?
4. Is surfing, running, or recovery affecting strength performance?

Core measures include completed sessions, rolling weekly consistency, volume by movement pattern, estimated strength trend, repetitions/weight at comparable RPE, running frequency/distance, surf frequency/duration, recovery trend, skipped sessions, and exercise plateaus.

Adaptation rules must distinguish a single bad day from a sustained trend. Suggested changes show the evidence and can be accepted, edited, or rejected.

### 5. Persistent exercise bank

The exercise bank is a reusable product asset, not a fixed list embedded in the interface. Any exercise proposed by the coach must be available for later programs, substitutions, progress analysis, and search.

When the coach believes an exercise that is not yet in the bank is needed, it must:

1. explain the training gap it addresses;
2. check aliases to avoid creating a duplicate;
3. create a complete draft exercise entry;
4. ask the user to approve adding it to the permanent bank;
5. add it to the program only after the bank entry is saved;
6. retain the source and reason for the addition.

The coach must not create a one-off free-text exercise inside a workout. If an urgent substitution is required, it should first use an existing equivalent from the bank. A new exercise requires the normal persistent-bank flow.

Every bank entry includes:

- stable ID, display name, aliases, and language variants;
- movement pattern, primary/secondary muscles, and training purpose;
- surf relevance and the specific capability it supports;
- equipment, difficulty, unilateral/bilateral flag, and mobility/strength/power classification;
- default sets, repetitions or hold duration, rest, and load type;
- progression and regression options;
- substitutions and exercises it should not be paired with under fatigue;
- concise technique cues, common mistakes, and stop conditions;
- demonstration media status and attribution;
- creation source, approval status, and revision history.

#### Priority additions to the bank

**Add first — clear gaps in the current bank**

- 90/90 hip rotation — hip internal/external rotation and surf stance mobility.
- Pallof hold — timed anti-rotation control; distinct from the existing Pallof press.
- Dead bug — trunk control without spinal loading.
- Side plank — lateral trunk endurance for stance stability.
- Copenhagen plank — adductor and lateral-chain strength; begin with a short-lever regression.
- Suitcase carry — anti-lateral-flexion core and grip.
- Farmer carry — grip, trunk stiffness, and general work capacity.
- Face pull — scapular retraction, external rotation, and shoulder balance.
- Cable or band external rotation — rotator-cuff capacity for paddling volume.
- Serratus wall slide — upward rotation and scapular control.
- Scapular push-up — serratus strength and controlled protraction.
- Straight-arm pulldown — lat and shoulder-extension endurance relevant to paddling.

**Add next — strength, power, and unilateral control**

- Bulgarian split squat — unilateral leg strength and stance control.
- Step-up — single-leg force production with simple load progression.
- Hip thrust or glute bridge — hip extension with lower spinal demand than another hinge.
- Chest-supported row — pulling volume with reduced lower-back fatigue.
- Dumbbell bench press — independent-arm pressing and a useful bench-press variation.
- Half-kneeling landmine press — shoulder-friendly diagonal press with trunk control.
- Kettlebell swing — repeatable hip power and conditioning when technique is appropriate.
- Medicine-ball rotational throw — rotational power without using slow heavy cable rotations as a power drill.
- Box jump or broad-jump landing progression — explosive takeoff and controlled landing.
- Surf pop-up drill — task-specific transition speed and coordination.

**Mobility and preparation options**

- Open-book thoracic rotation.
- Half-kneeling ankle dorsiflexion.
- Couch stretch.
- Adductor rock-back.
- Shoulder controlled articular rotation.

Mobility drills should be tracked by duration, repetitions, side, and perceived restriction rather than weight. Carries and holds require distance/time fields. Power exercises require quality and velocity-loss stopping rules rather than training to failure.

#### Bank governance and recommendation rules

- Prefer the smallest effective bank addition; do not add novelty for its own sake.
- Add an exercise only when it fills a movement, equipment, progression, pain-free substitution, or plateau-management gap.
- Reuse aliases such as “Pallof isometric” and “Pallof hold” under one canonical entry.
- Do not infer that a surf-specific label makes an exercise superior; preserve balanced squat, hinge, push, pull, carry, core, power, and mobility coverage.
- Require explicit confirmation before replacing a foundational exercise in a saved program.
- Keep historical exercise IDs stable so progress remains comparable after a rename.
- Never auto-prescribe advanced plyometrics or high-fatigue work from a generic AI suggestion without prerequisites and conservative defaults.

## Information architecture

Four primary destinations:

1. **Today** — today/tomorrow recommendation and coach composer.
2. **Week** — seven-day surf-first adaptive planner.
3. **Workout** — active strength session and spoken coaching.
4. **Progress** — trends, goal adherence, and proposed routine changes.

Programs remain accessible as a secondary management view rather than a primary daily destination.

## Coach interaction model

Outside a workout, the coach supports typed questions and optional voice input. During a gym workout, output is spoken while input is button-first or typed.

Coach speech should be concise and interruptible. Essential cues are also displayed. Speech controls include repeat, pause coach, mute coach, and stop coaching.

## Music behavior

### Initial release

- Start or return to a chosen Spotify playlist through a clear music control.
- Spoken cues are brief and user-configurable.
- Provide independent coach volume/mute controls and a “repeat cue” action.
- Do not claim reliable music-volume ducking when music is playing in another mobile app; behavior must be tested per platform.

### Later integration

- Optional authenticated Spotify playback control where supported.
- Pause or reduce music during coaching cues when the playback platform permits it.
- Resume playback automatically after the cue.

Generated music is not required for the core product and should not delay coaching, planning, or progress features.

## Recommendation inputs

- Future surf plans entered by the user.
- Wave forecast and forecast confidence.
- Garmin activities, including detected surf, run, swim, and strength.
- Garmin sleep, HRV, readiness, resting heart rate, stress, and body battery when available.
- FlowFit set history, RPE, weights, repetitions, skipped exercises, pain feedback, and workout completion.
- Weekly goals and personal preferences.

## Recommendation outputs

- Today and tomorrow activity.
- Best matching strength program and exercise order.
- Session duration, intensity, and volume.
- Set-level weight/repetition/RPE targets.
- Recovery or substitution recommendation.
- A proposed change to the base routine, with evidence and confirmation.

## Safety boundaries

- Stop and advise professional evaluation for sharp pain, dizziness, chest pain, or injury symptoms.
- Never infer medical diagnoses from Garmin or training data.
- Clearly distinguish wellness guidance from medical advice.
- Preserve an auditable history of AI-suggested changes and user approvals.

## Success metrics

- At least one run completed per rolling seven days.
- Strength-session adherence against the configured weekly target.
- Surf opportunities accepted without avoidable conflict with key strength sessions.
- Improvement in comparable exercise performance over four- and eight-week windows.
- Percentage of recommendations accepted versus manually replaced.
- Workout-resume success and set-save reliability.
- Low interaction burden during active workouts.

## Missing capabilities in the current app

### Critical

- Future-day activity planning and explicit surf commitments.
- Seven-day constraint-based rescheduling after a plan or Garmin activity changes.
- Separate recommendations for today and tomorrow.
- Goal enforcement for at least one weekly run and configurable strength frequency.
- In-workout spoken coaching with button-first responses.
- Set-level adaptive changes during an active workout.
- Reliable progress analysis based on comparable sets and RPE.
- Evidence-backed proposals to change exercises, weights, repetitions, or volume.
- A persistent, structured exercise bank that the coach can safely extend with user approval.
- Alias detection and exercise-specific schemas for repetitions, timed holds, carries, mobility, and power work.

### Important

- Swim as a first-class activity.
- Reconciliation between planned and Garmin-detected activities.
- Planner notifications and reminders.
- Plateau, fatigue, imbalance, and missed-session detection.
- Dedicated Progress view with weekly/monthly comparisons.
- Coach audio controls and repeat/mute behavior alongside music.
- Persistent user goals, constraints, injuries, equipment, and preferred training days.
- Exercise-bank search, filters, substitutions, progressions/regressions, demonstration media, and revision history.

### Existing foundations to retain

- Garmin synchronization and seven-day activity display.
- Beit Yanai wave forecast.
- Editable strength programs and exercise library.
- Per-set saving, RPE, notes, resume state, and rest timer.
- AI coach text endpoint.
- Manual matching of Garmin strength activities to FlowFit programs.
- Spotify workout-playlist link.

## Delivery sequence

### Phase 1 — Planner and recommendations

Add goals, future activity commitments, weekly planner, plan/Garmin reconciliation, and deterministic surf-first scheduling. Replace the crowded dashboard with Today and Week views.

### Phase 2 — Strength coach

Add spoken cues, large response controls, set-level adaptations, workout-state persistence, and music-safe controls.

### Phase 3 — Progress engine

Add comparable-set analysis, plateaus, adherence, movement-pattern balance, proposed program changes, and the Progress view.

In parallel, migrate the hard-coded exercise gallery to the persistent exercise bank, add the priority exercise set, and enable coach-proposed bank additions with duplicate detection and user approval.

### Phase 4 — Deeper media and automation

Add optional Spotify playback control, notifications, richer calendar behavior, and longer-term training phases.
