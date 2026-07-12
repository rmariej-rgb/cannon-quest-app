import React, { useState, useEffect, useRef, useMemo } from "react";
import { Preferences } from "@capacitor/preferences";

/* ============================================================
   THE CANON QUEST — a gamified journey through the 100 most
   influential books ever written.
   Design: "library at night" — deep bottle-green shelves, gold
   tooling, lamplit paper panels. Signature element: The Shelf,
   100 real book spines that fill with color as you finish them.
   ============================================================ */

const FONTS_AND_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600;9..144,700;9..144,900&family=Spectral:ital,wght@0,300;0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
:root{
  --shelf:#141F19; --shelf2:#1C2A22; --shelf3:#243429;
  --gilt:#C8A24B; --gilt-soft:#8F7638;
  --paper:#F1EADA; --paper2:#E7DEC9;
  --ink:#22281F; --ink-soft:#5A5F51;
  --cream-text:#EDE6D3; --muted-text:#9AA394;
  --oxblood:#8E4B3F;
}
*{box-sizing:border-box}
body{margin:0}
.cq-root{min-height:100vh;background:
  radial-gradient(1200px 600px at 70% -10%, #223229 0%, transparent 60%),
  linear-gradient(180deg,#16221B 0%, #121C16 100%);
  color:var(--cream-text); font-family:'Spectral',Georgia,serif;}
.cq-display{font-family:'Fraunces',Georgia,serif}
.cq-mono{font-family:'IBM Plex Mono',monospace}
.cq-wrap{max-width:1080px;margin:0 auto;padding:0 20px calc(90px + env(safe-area-inset-bottom));padding-left:calc(20px + env(safe-area-inset-left));padding-right:calc(20px + env(safe-area-inset-right))}
.cq-nav{display:flex;gap:4px;align-items:center;padding:calc(18px + env(safe-area-inset-top)) 0 14px;flex-wrap:wrap;border-bottom:1px solid rgba(200,162,75,.22);position:sticky;top:0;z-index:40;
  background:linear-gradient(180deg,rgba(20,31,25,.97),rgba(20,31,25,.92));backdrop-filter:blur(6px)}
.cq-brand{font-family:'Fraunces';font-weight:600;font-size:20px;letter-spacing:.5px;color:var(--gilt);margin-right:auto;display:flex;align-items:baseline;gap:9px}
.cq-brand small{font-family:'IBM Plex Mono';font-size:10px;color:var(--muted-text);letter-spacing:1.5px;text-transform:uppercase}
.cq-tab{background:none;border:1px solid transparent;color:var(--muted-text);font-family:'IBM Plex Mono';font-size:12px;letter-spacing:1px;text-transform:uppercase;padding:8px 13px;border-radius:3px;cursor:pointer;transition:all .18s}
.cq-tab:hover{color:var(--cream-text)}
.cq-tab.on{color:var(--gilt);border-color:rgba(200,162,75,.4);background:rgba(200,162,75,.07)}
.cq-tab:focus-visible,.cq-btn:focus-visible,button:focus-visible{outline:2px solid var(--gilt);outline-offset:2px}
.cq-rule{display:flex;align-items:center;gap:12px;margin:34px 0 16px;color:var(--gilt)}
.cq-rule h2{font-family:'Fraunces';font-weight:500;font-size:21px;margin:0;letter-spacing:.3px}
.cq-rule::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,rgba(200,162,75,.5),transparent)}
.cq-eyebrow{font-family:'IBM Plex Mono';font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--gilt-soft)}
.cq-btn{font-family:'IBM Plex Mono';font-size:12px;letter-spacing:.6px;padding:9px 15px;border-radius:3px;border:1px solid rgba(200,162,75,.45);background:rgba(200,162,75,.08);color:var(--gilt);cursor:pointer;transition:all .16s}
.cq-btn:hover{background:rgba(200,162,75,.18)}
.cq-btn.solid{background:var(--gilt);color:#20190a;border-color:var(--gilt);font-weight:600}
.cq-btn.solid:hover{background:#D9B45E}
.cq-btn.ghost{border-color:rgba(237,230,211,.25);color:var(--cream-text);background:transparent}
.cq-btn.sm{padding:6px 10px;font-size:11px}
.cq-card{background:linear-gradient(180deg,var(--shelf2),#18251E);border:1px solid rgba(200,162,75,.16);border-radius:6px;padding:18px}
.cq-paper{background:linear-gradient(180deg,var(--paper),var(--paper2));color:var(--ink);border-radius:6px;border:1px solid #C9BC9E;box-shadow:0 8px 30px rgba(0,0,0,.45)}
.cq-stat{padding:14px 16px}
.cq-stat .v{font-family:'Fraunces';font-size:30px;font-weight:600;color:var(--cream-text);line-height:1.05}
.cq-stat .l{font-family:'IBM Plex Mono';font-size:10px;letter-spacing:1.4px;text-transform:uppercase;color:var(--muted-text);margin-top:5px}
.cq-grid-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px}
.cq-bar{height:7px;border-radius:99px;background:rgba(237,230,211,.12);overflow:hidden}
.cq-bar>i{display:block;height:100%;background:linear-gradient(90deg,#8F7638,var(--gilt));border-radius:99px;transition:width .7s cubic-bezier(.2,.8,.2,1)}
.shelfrow{display:flex;align-items:flex-end;gap:2px;padding:0 8px;min-height:64px}
.shelfboard{height:9px;border-radius:2px;background:linear-gradient(180deg,#3A2C1B,#241a0f);box-shadow:0 3px 6px rgba(0,0,0,.5);margin:0 0 10px}
.spine{flex:1;min-width:5px;border-radius:2px 2px 0 0;cursor:pointer;position:relative;transition:transform .15s,filter .15s;border:none;padding:0}
.spine:hover{transform:translateY(-5px);filter:brightness(1.25)}
.spine.todo{background:rgba(237,230,211,.10)!important;box-shadow:inset 0 0 0 1px rgba(237,230,211,.07)}
.spine.reading{box-shadow:0 0 0 1.5px var(--gilt), 0 0 12px rgba(200,162,75,.45)}
.spine.done::after{content:'';position:absolute;left:15%;right:15%;top:7px;height:2px;background:rgba(255,245,215,.55)}
.cq-badge{display:flex;flex-direction:column;align-items:center;gap:8px;width:104px;text-align:center}
.cq-badge .medal{width:62px;height:62px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;
  background:radial-gradient(circle at 32% 28%, #E4C876, #A07E2E 68%, #6d5420);border:2px solid #E9D08A;box-shadow:0 4px 14px rgba(0,0,0,.5), inset 0 0 10px rgba(255,255,255,.25)}
.cq-badge.locked .medal{background:#232e27;border-color:rgba(237,230,211,.15);box-shadow:none;filter:grayscale(1);opacity:.55}
.cq-badge .bn{font-family:'IBM Plex Mono';font-size:10px;letter-spacing:.5px;color:var(--cream-text)}
.cq-badge.locked .bn{color:var(--muted-text)}
.cq-badge .bd{font-size:11px;color:var(--muted-text);line-height:1.35}
.bookcard{display:flex;gap:14px;padding:15px;border-radius:6px;background:linear-gradient(180deg,var(--shelf2),#18251E);border:1px solid rgba(200,162,75,.14);transition:border-color .15s, transform .15s;cursor:pointer}
.bookcard:hover{border-color:rgba(200,162,75,.45);transform:translateY(-2px)}
.cover{width:64px;min-width:64px;height:94px;border-radius:2px 5px 5px 2px;display:flex;flex-direction:column;justify-content:space-between;padding:8px 7px;color:#F5EEDC;position:relative;box-shadow:3px 4px 10px rgba(0,0,0,.45)}
.cover::before{content:'';position:absolute;left:5px;top:0;bottom:0;width:1.5px;background:rgba(0,0,0,.28)}
.cover .ct{font-family:'Fraunces';font-size:9.5px;font-weight:600;line-height:1.2}
.cover .ca{font-family:'IBM Plex Mono';font-size:7px;opacity:.85}
.tag{display:inline-block;font-family:'IBM Plex Mono';font-size:9.5px;letter-spacing:.4px;padding:2.5px 7px;border-radius:99px;border:1px solid rgba(237,230,211,.22);color:var(--muted-text);margin:0 4px 4px 0}
.dots{display:inline-flex;gap:2.5px;vertical-align:middle}
.dots i{width:6px;height:6px;border-radius:50%;background:rgba(237,230,211,.15)}
.dots i.f{background:var(--gilt)}
.cq-select,.cq-input{background:#1A2620;border:1px solid rgba(200,162,75,.25);color:var(--cream-text);font-family:'IBM Plex Mono';font-size:12px;border-radius:3px;padding:8px 10px}
.cq-input::placeholder{color:var(--muted-text)}
textarea.cq-input{font-family:'Spectral';font-size:14px;line-height:1.5;width:100%}
.modalveil{position:fixed;inset:0;background:rgba(8,12,10,.75);backdrop-filter:blur(3px);z-index:60;display:flex;align-items:flex-start;justify-content:center;overflow-y:auto;padding:30px 14px}
.modal{max-width:720px;width:100%;margin:auto;animation:rise .3s ease}
@keyframes rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
.toaststack{position:fixed;bottom:calc(18px + env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);z-index:90;display:flex;flex-direction:column;gap:8px;align-items:center}
.toast{background:linear-gradient(180deg,#2A3A2F,#1E2C24);border:1px solid var(--gilt);color:var(--cream-text);font-family:'IBM Plex Mono';font-size:12px;padding:10px 18px;border-radius:99px;box-shadow:0 6px 24px rgba(0,0,0,.6);animation:pop .35s cubic-bezier(.2,1.4,.4,1)}
@keyframes pop{from{opacity:0;transform:scale(.85) translateY(8px)}to{opacity:1;transform:none}}
.era{min-width:230px;background:linear-gradient(180deg,var(--shelf2),#18251E);border:1px solid rgba(200,162,75,.16);border-radius:6px;padding:14px}
.era h4{font-family:'Fraunces';font-weight:500;margin:2px 0 2px;font-size:16px;color:var(--gilt)}
.chip{display:flex;gap:7px;align-items:center;background:rgba(0,0,0,.22);border:1px solid transparent;border-radius:4px;padding:5px 8px;margin-top:6px;cursor:pointer;width:100%;text-align:left;color:var(--cream-text);font-family:'Spectral';font-size:12.5px}
.chip:hover{border-color:rgba(200,162,75,.4)}
.chip .sq{width:9px;height:14px;border-radius:1.5px;flex-shrink:0}
.bridge{display:flex;flex-direction:column;justify-content:center;min-width:120px;max-width:150px;color:var(--muted-text);font-size:11.5px;font-style:italic;line-height:1.45;padding:0 4px;text-align:center}
.bridge b{color:var(--gilt);font-size:15px;font-style:normal}
.levelring{position:relative;width:118px;height:118px;flex-shrink:0}
.levelring .num{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.pathcard{border:1px solid rgba(200,162,75,.18);border-radius:6px;padding:18px;background:linear-gradient(180deg,var(--shelf2),#17241D);cursor:pointer;transition:border-color .15s}
.pathcard:hover{border-color:rgba(200,162,75,.5)}
.pathcard.active{border-color:var(--gilt);box-shadow:0 0 0 1px var(--gilt) inset}
.qbtn{flex:1;min-width:180px;text-align:left;background:linear-gradient(180deg,var(--shelf2),#17241D);border:1px solid rgba(200,162,75,.2);border-radius:6px;padding:14px 16px;color:var(--cream-text);cursor:pointer;font-family:'Spectral';transition:border-color .15s}
.qbtn:hover{border-color:var(--gilt)}
.qbtn .qt{font-family:'Fraunces';font-size:15.5px;color:var(--gilt);font-weight:500}
.qbtn .qd{font-size:12.5px;color:var(--muted-text);margin-top:3px}
.starrow button{background:none;border:none;font-size:22px;cursor:pointer;color:rgba(237,230,211,.25);padding:2px}
.starrow button.on{color:var(--gilt)}
@media(max-width:640px){ .cq-wrap{padding:0 12px calc(80px + env(safe-area-inset-bottom))} .cq-brand small{display:none} .bookcard{padding:12px} }
@media (prefers-reduced-motion: reduce){ *{animation:none!important;transition:none!important} }
`;

const GENRE_COLORS = {
  "Classic Literature":"#B3773F","Dystopian & Futurism":"#56707E","Philosophy":"#7C8A52",
  "Science":"#3F7F74","Psychology":"#96628B","History":"#8E4B3F","Politics":"#3E6286",
  "Economics":"#A98A38","Feminism & Social Thought":"#B25E6B","Technology":"#5C6F9E",
  "Biography & Memoir":"#7A6A50","Art & Creativity":"#C77E52"
};

/* ---------- THE 100 BOOKS ---------- */
const BOOKS = [
{id:1,t:"The Iliad",a:"Homer",y:-750,g:"Classic Literature",p:704,c:"Greece",d:4,i:5,tg:["war","honor","fate","epic"],ds:"An epic of the Trojan War centered on the rage of Achilles and the terrible human cost of glory.",w:"The foundational epic of Western literature, shaping ideas of heroism, fate, and tragedy for nearly three millennia.",mi:"The epic hero; glory versus mortality; fate and the gods",inf:"Virgil's Aeneid, Greek tragedy, all Western epic poetry"},
{id:2,t:"The Odyssey",a:"Homer",y:-700,g:"Classic Literature",p:560,c:"Greece",d:3,i:5,tg:["journey","cunning","homecoming","epic"],ds:"Odysseus spends ten years fighting his way home from Troy, outwitting monsters, gods, and his own pride.",w:"The archetypal journey narrative — nearly every quest story ever told traces its shape back to this poem.",mi:"The hero's journey; cunning over force; homecoming (nostos)",inf:"Joyce's Ulysses, the entire quest genre from Dante to Star Wars"},
{id:3,t:"Oedipus Rex",a:"Sophocles",y:-429,g:"Classic Literature",p:90,c:"Greece",d:3,i:5,tg:["fate","tragedy","identity"],ds:"A king relentlessly investigates the cause of a plague, only to discover the culprit is himself.",w:"The model of dramatic tragedy — the play Aristotle used to define the form and Freud used to name a complex.",mi:"Tragic irony; the limits of self-knowledge",inf:"Aristotle's Poetics, Freud, all tragic drama"},
{id:4,t:"The Tale of Genji",a:"Murasaki Shikibu",y:1010,g:"Classic Literature",p:1200,c:"Japan",d:4,i:4,tg:["court life","love","impermanence"],ds:"The loves and losses of a radiant Heian-era prince, told with startling psychological subtlety.",w:"Often called the world's first novel — written by a woman at the Japanese court a thousand years ago.",mi:"Psychological interiority; mono no aware (the pathos of things)",inf:"The modern novel; centuries of Japanese art and literature"},
{id:5,t:"The Divine Comedy",a:"Dante Alighieri",y:1320,g:"Classic Literature",p:800,c:"Italy",d:5,i:5,tg:["afterlife","justice","love","allegory"],ds:"A pilgrim travels through Hell, Purgatory, and Paradise, guided first by Virgil and then by love itself.",w:"Unified the entire medieval worldview into one poem and elevated Italian into a great literary language.",mi:"Allegorical journey of the soul; poetic justice (contrapasso)",inf:"Milton, Chaucer, T.S. Eliot, visual art from Botticelli to video games"},
{id:6,t:"The Canterbury Tales",a:"Geoffrey Chaucer",y:1400,g:"Classic Literature",p:500,c:"England",d:4,i:4,tg:["society","satire","storytelling"],ds:"A cross-section of medieval society swaps stories — pious, bawdy, and everything between — on a pilgrimage to Canterbury.",w:"Established English as a language fit for great literature and painted the first full portrait of a whole society.",mi:"The frame narrative; social satire across classes",inf:"English literature itself; Shakespeare; the modern short story collection"},
{id:7,t:"Don Quixote",a:"Miguel de Cervantes",y:1605,g:"Classic Literature",p:1000,c:"Spain",d:4,i:5,tg:["idealism","madness","satire"],ds:"An aging gentleman reads too many chivalric romances and rides out to be a knight in a world that has moved on.",w:"Widely considered the first modern novel — the book that taught fiction to be self-aware, ironic, and humane.",mi:"The novel as form; idealism versus reality; the unreliable line between fiction and life",inf:"Flaubert, Dostoevsky, Borges — essentially all novelists since"},
{id:8,t:"Hamlet",a:"William Shakespeare",y:1603,g:"Classic Literature",p:200,c:"England",d:3,i:5,tg:["revenge","doubt","mortality"],ds:"A prince commanded to avenge his father's murder finds himself paralyzed by thought, grief, and doubt.",w:"The deepest portrait of human consciousness in drama — 'to be or not to be' made inwardness the subject of art.",mi:"The soliloquy as window into the mind; modern psychological man",inf:"Goethe, Freud, existentialism, virtually all serious drama"},
{id:9,t:"Paradise Lost",a:"John Milton",y:1667,g:"Classic Literature",p:450,c:"England",d:5,i:4,tg:["rebellion","free will","fall"],ds:"An epic retelling of the fall of Satan and of humankind, with the most charismatic villain in literature.",w:"Shaped how the West imagines Satan, temptation, and free will; the summit of the English epic.",mi:"The sympathetic rebel; free will and its price",inf:"Blake, the Romantics, Frankenstein, His Dark Materials"},
{id:10,t:"Gulliver's Travels",a:"Jonathan Swift",y:1726,g:"Classic Literature",p:350,c:"Ireland",d:3,i:4,tg:["satire","politics","human nature"],ds:"A ship's surgeon voyages to lands of tiny people, giants, and rational horses — each a mirror held up to humanity.",w:"The template for political and social satire; proof that fantasy can be the sharpest form of criticism.",mi:"Satire through invented worlds; skepticism of human reason",inf:"Voltaire, Orwell, dystopian fiction, science fiction"},
{id:11,t:"Faust",a:"Johann Wolfgang von Goethe",y:1808,g:"Classic Literature",p:500,c:"Germany",d:4,i:4,tg:["ambition","knowledge","temptation"],ds:"A restless scholar bargains his soul to the devil in exchange for unlimited knowledge and experience.",w:"Gave the modern world its defining myth of ambition — the 'Faustian bargain' — and crowned German literature.",mi:"The Faustian bargain; endless striving as the modern condition",inf:"Romanticism, Thomas Mann, countless retellings in every medium"},
{id:12,t:"Pride and Prejudice",a:"Jane Austen",y:1813,g:"Classic Literature",p:430,c:"England",d:2,i:5,tg:["marriage","class","wit","first impressions"],ds:"Elizabeth Bennet and Mr. Darcy misjudge each other completely — and slowly, wittily, learn better.",w:"Perfected the social novel and the marriage plot; the model for two centuries of romantic and comic fiction.",mi:"Free indirect style; irony as moral insight",inf:"George Eliot, the modern romance genre, all comedy of manners"},
{id:13,t:"Frankenstein",a:"Mary Shelley",y:1818,g:"Classic Literature",p:280,c:"England",d:2,i:5,tg:["creation","science","responsibility","monster"],ds:"A young scientist assembles a living being and then abandons it, with catastrophic consequences for both.",w:"Invented science fiction at age eighteen and posed the question every technology since has had to answer: just because we can, should we?",mi:"The ethics of creation; the creature as mirror of the creator",inf:"All science fiction; bioethics debates; AI discourse today"},
{id:14,t:"Jane Eyre",a:"Charlotte Brontë",y:1847,g:"Classic Literature",p:530,c:"England",d:3,i:4,tg:["independence","love","selfhood"],ds:"An orphaned governess insists on her own dignity and desires in a world that offers her neither.",w:"A revolutionary first-person female voice — 'I am no bird; and no net ensnares me' — that changed whose inner life fiction takes seriously.",mi:"Female interiority and moral autonomy",inf:"The feminist novel; Wide Sargasso Sea; gothic romance"},
{id:15,t:"Moby-Dick",a:"Herman Melville",y:1851,g:"Classic Literature",p:720,c:"United States",d:5,i:5,tg:["obsession","nature","fate","the sea"],ds:"Captain Ahab hunts the white whale that took his leg, dragging his crew into the vortex of his obsession.",w:"The great American novel — a whaling adventure that swallows philosophy, theology, and the encyclopedia whole.",mi:"Obsession as tragedy; the novel as total form",inf:"Faulkner, Cormac McCarthy, modern maximalist fiction"},
{id:16,t:"Crime and Punishment",a:"Fyodor Dostoevsky",y:1866,g:"Classic Literature",p:670,c:"Russia",d:4,i:5,tg:["guilt","morality","redemption"],ds:"A destitute student murders a pawnbroker to prove a theory — and discovers what conscience actually is.",w:"The psychological novel at full power; a demolition of the idea that intellect can exempt us from morality.",mi:"Crime as psychological event; the extraordinary-man theory refuted",inf:"Nietzsche, existentialism, crime fiction, Camus"},
{id:17,t:"War and Peace",a:"Leo Tolstoy",y:1869,g:"Classic Literature",p:1225,c:"Russia",d:5,i:5,tg:["war","history","family","fate"],ds:"Five aristocratic families live, love, and are remade as Napoleon's armies sweep into Russia.",w:"The most ambitious novel ever attempted — a theory of history, a war epic, and an intimate family story at once.",mi:"History as the sum of countless small acts; realism at epic scale",inf:"The historical novel; Vasily Grossman; modern epic fiction"},
{id:18,t:"Middlemarch",a:"George Eliot",y:1871,g:"Classic Literature",p:880,c:"England",d:4,i:4,tg:["marriage","ambition","community","compromise"],ds:"An entire provincial town — its idealists, egotists, and quiet heroes — rendered with unmatched sympathy.",w:"Often called the greatest English novel; the deepest study of how ordinary lives bend under ideals and circumstance.",mi:"The web of social interdependence; moral realism",inf:"Henry James, Virginia Woolf, the modern realist tradition"},
{id:19,t:"Adventures of Huckleberry Finn",a:"Mark Twain",y:1884,g:"Classic Literature",p:370,c:"United States",d:2,i:5,tg:["freedom","race","conscience","the river"],ds:"A runaway boy and an escaped enslaved man raft down the Mississippi, and a friendship outgrows a society's morality.",w:"Brought the American vernacular voice into literature; Hemingway claimed all modern American writing descends from it.",mi:"Vernacular narration; conscience against corrupt social norms",inf:"Hemingway, Salinger, the American novel's voice"},
{id:20,t:"Heart of Darkness",a:"Joseph Conrad",y:1899,g:"Classic Literature",p:100,c:"England",d:4,i:4,tg:["imperialism","darkness","civilization"],ds:"A riverboat captain journeys up the Congo in search of the brilliant, monstrous ivory trader Kurtz.",w:"The most searing early indictment of European imperialism and a founding text of modernist ambiguity.",mi:"The hollowness of 'civilization'; unreliable narrative frames",inf:"Modernism, postcolonial criticism, Apocalypse Now"},
{id:21,t:"Ulysses",a:"James Joyce",y:1922,g:"Classic Literature",p:730,c:"Ireland",d:5,i:5,tg:["consciousness","the everyday","language"],ds:"One ordinary Dublin day — June 16, 1904 — rendered through every register and trick language possesses.",w:"The summit of literary modernism; it made the inside of an ordinary mind the grandest subject in fiction.",mi:"Stream of consciousness; the epic of the everyday",inf:"Woolf, Faulkner, Beckett — the shape of modern fiction"},
{id:22,t:"The Great Gatsby",a:"F. Scott Fitzgerald",y:1925,g:"Classic Literature",p:180,c:"United States",d:2,i:5,tg:["the American Dream","wealth","longing"],ds:"A mysterious millionaire throws glittering parties across the bay from the woman he cannot stop wanting back.",w:"The definitive fable of the American Dream — its glamour, its rot, and the green light that recedes forever.",mi:"The American Dream as tragedy; the unreliable golden surface",inf:"American fiction, film, and the culture's self-image"},
{id:23,t:"Mrs Dalloway",a:"Virginia Woolf",y:1925,g:"Classic Literature",p:195,c:"England",d:4,i:4,tg:["consciousness","time","trauma"],ds:"A society hostess prepares for a party while a shell-shocked veteran unravels across London — one June day, two minds.",w:"Proved a single ordinary day contains a whole life; reshaped how fiction represents time and thought.",mi:"Interior time versus clock time; the porous self",inf:"Modern literary fiction; The Hours; narrative psychology"},
{id:24,t:"The Trial",a:"Franz Kafka",y:1925,g:"Classic Literature",p:255,c:"Czechia",d:3,i:5,tg:["bureaucracy","guilt","absurdity"],ds:"Josef K. is arrested one morning for a crime that is never named, by a court that is everywhere and nowhere.",w:"Gave the modern world the word 'Kafkaesque' — the definitive nightmare of faceless bureaucratic power.",mi:"Absurd guilt; the individual versus the opaque system",inf:"Orwell, Camus, dystopian fiction, legal and political thought"},
{id:25,t:"Things Fall Apart",a:"Chinua Achebe",y:1958,g:"Classic Literature",p:210,c:"Nigeria",d:2,i:5,tg:["colonialism","tradition","masculinity"],ds:"A proud Igbo wrestler and leader watches his world come apart as missionaries and colonial rule arrive.",w:"Founded modern African literature in English and answered a century of colonial storytelling with the view from the other side.",mi:"Colonialism from the colonized perspective; cultural collision",inf:"African and postcolonial literature worldwide"},
{id:26,t:"Invisible Man",a:"Ralph Ellison",y:1952,g:"Classic Literature",p:580,c:"United States",d:4,i:4,tg:["race","identity","invisibility"],ds:"An unnamed Black man moves from a Southern college to Harlem, invisible to everyone who looks at him.",w:"The great novel of Black American identity — of being seen only as a symbol and never as a self.",mi:"Social invisibility; identity versus imposed roles",inf:"Toni Morrison, American literature on race and selfhood"},
{id:27,t:"To Kill a Mockingbird",a:"Harper Lee",y:1960,g:"Classic Literature",p:280,c:"United States",d:1,i:4,tg:["justice","childhood","race"],ds:"Through a young girl's eyes, a small-town lawyer defends a Black man falsely accused in Depression-era Alabama.",w:"Shaped the moral imagination of generations of readers on justice, empathy, and moral courage.",mi:"Moral education; empathy as climbing into another's skin",inf:"American civic culture; courtroom drama; young-adult fiction"},
{id:28,t:"One Hundred Years of Solitude",a:"Gabriel García Márquez",y:1967,g:"Classic Literature",p:420,c:"Colombia",d:4,i:5,tg:["family","memory","magic","time"],ds:"Seven generations of the Buendía family rise and fall in the mythical town of Macondo, where the miraculous is ordinary.",w:"Defined magical realism and announced Latin American literature to the world; a founding text of the global novel.",mi:"Magical realism; cyclical time; history as family memory",inf:"Salman Rushdie, Toni Morrison, world literature since 1970"},
{id:29,t:"Beloved",a:"Toni Morrison",y:1987,g:"Classic Literature",p:320,c:"United States",d:4,i:4,tg:["slavery","memory","motherhood","haunting"],ds:"A formerly enslaved mother is haunted — literally — by the daughter she killed to keep out of slavery.",w:"The essential American novel of slavery's afterlife; it made historical trauma the central subject of national literature.",mi:"Rememory; the unspeakable made narratable",inf:"Contemporary fiction on trauma and history worldwide"},
{id:30,t:"1984",a:"George Orwell",y:1949,g:"Dystopian & Futurism",p:330,c:"England",d:2,i:5,tg:["surveillance","totalitarianism","truth","language"],ds:"In a state that watches everything and rewrites the past, one man commits the crime of thinking for himself.",w:"The single most influential political novel ever written — Big Brother, doublethink, and thoughtcrime entered every language.",mi:"Surveillance state; control of language as control of thought",inf:"All political discourse since; dystopian fiction; privacy debates"},
{id:31,t:"Brave New World",a:"Aldous Huxley",y:1932,g:"Dystopian & Futurism",p:310,c:"England",d:2,i:5,tg:["pleasure","technology","conformity","control"],ds:"A future society keeps everyone happy with engineered pleasure, drugs, and distraction — and one man refuses.",w:"The counter-prophecy to Orwell: control not by pain but by pleasure; eerily prescient about consumer and biotech society.",mi:"Soft totalitarianism; happiness versus freedom",inf:"Bioethics, media criticism, Amusing Ourselves to Death"},
{id:32,t:"Animal Farm",a:"George Orwell",y:1945,g:"Dystopian & Futurism",p:110,c:"England",d:1,i:4,tg:["revolution","power","allegory"],ds:"The animals of a farm overthrow their farmer — and watch their revolution curdle into a new tyranny.",w:"The perfect political allegory; 'all animals are equal, but some are more equal than others' explained the Soviet century in one fable.",mi:"How revolutions are betrayed; allegory as political weapon",inf:"Cold War political culture; satire; civic education"},
{id:33,t:"Fahrenheit 451",a:"Ray Bradbury",y:1953,g:"Dystopian & Futurism",p:250,c:"United States",d:1,i:4,tg:["censorship","books","media"],ds:"In a future where firemen burn books, one of them begins to wonder what's inside the things he destroys.",w:"The great parable of censorship and of a culture that abandons reading for wall-sized screens — written in 1953.",mi:"Self-imposed censorship; mass media as anesthetic",inf:"Free-speech discourse; media criticism; library culture"},
{id:34,t:"The Handmaid's Tale",a:"Margaret Atwood",y:1985,g:"Dystopian & Futurism",p:310,c:"Canada",d:2,i:4,tg:["patriarchy","theocracy","resistance","bodies"],ds:"In a theocratic America, fertile women are property of the state — and one of them is quietly recording everything.",w:"The defining feminist dystopia; its imagery became a global protest vocabulary for reproductive rights.",mi:"Speculative fiction built only from historical precedent",inf:"Contemporary feminist thought, protest culture, prestige TV"},
{id:35,t:"Neuromancer",a:"William Gibson",y:1984,g:"Dystopian & Futurism",p:270,c:"United States",d:3,i:4,tg:["cyberspace","AI","corporations"],ds:"A burned-out hacker is hired for one last run through the matrix by an employer who may not be human.",w:"Invented cyberpunk and popularized 'cyberspace' — the internet was imagined here before it existed.",mi:"Cyberspace; the human-machine merger",inf:"The Matrix, Silicon Valley's imagination, all cyberpunk"},
{id:36,t:"The Republic",a:"Plato",y:-375,g:"Philosophy",p:400,c:"Greece",d:4,i:5,tg:["justice","the ideal state","education","truth"],ds:"Socrates and friends attempt to define justice by designing an ideal city — and end up questioning reality itself.",w:"The fountainhead of Western philosophy; the allegory of the cave still frames how we talk about truth and illusion.",mi:"The theory of Forms; the allegory of the cave; philosopher-kings",inf:"All of Western philosophy — 'footnotes to Plato'"},
{id:37,t:"Nicomachean Ethics",a:"Aristotle",y:-340,g:"Philosophy",p:350,c:"Greece",d:4,i:5,tg:["virtue","happiness","character"],ds:"A systematic inquiry into the good life: happiness as excellent activity, virtue as a habit found between extremes.",w:"The foundation of virtue ethics; its questions about flourishing anchor moral philosophy and modern positive psychology alike.",mi:"Eudaimonia; the golden mean; virtue as habit",inf:"Aquinas, modern virtue ethics, character education"},
{id:38,t:"Tao Te Ching",a:"Laozi",y:-400,g:"Philosophy",p:90,c:"China",d:3,i:5,tg:["nature","simplicity","paradox","flow"],ds:"Eighty-one brief, paradoxical poems on living in accord with the Tao — the unnameable way of nature.",w:"One of the most translated books in history; the root of Taoist thought and a quiet influence on everything from strategy to design.",mi:"Wu wei (effortless action); strength in yielding",inf:"Chinese civilization, Zen, Western counterculture and design"},
{id:39,t:"The Analects",a:"Confucius",y:-475,g:"Philosophy",p:250,c:"China",d:3,i:5,tg:["virtue","society","duty","education"],ds:"Collected sayings of Confucius on how personal virtue, family devotion, and ritual sustain a good society.",w:"The single most influential book in East Asian history — it structured Chinese government, education, and family life for two millennia.",mi:"Ren (humaneness); the rectification of names; government by virtue",inf:"Two thousand years of East Asian civilization"},
{id:40,t:"Meditations",a:"Marcus Aurelius",y:180,g:"Philosophy",p:250,c:"Rome",d:2,i:5,tg:["stoicism","mortality","self-discipline"],ds:"The private notebook of a Roman emperor reminding himself, nightly, how to be good, calm, and mortal.",w:"The most intimate document of Stoic philosophy ever written — and the engine of Stoicism's modern revival.",mi:"Control what you can, accept what you cannot; the view from above",inf:"Modern Stoicism, cognitive behavioral therapy, leadership culture"},
{id:41,t:"Essays",a:"Michel de Montaigne",y:1580,g:"Philosophy",p:850,c:"France",d:3,i:4,tg:["self-examination","skepticism","the everyday"],ds:"A retired magistrate writes about everything — friendship, cannibals, thumbs, death — and mostly about himself, honestly.",w:"Invented the essay ('essai' — an attempt) and modern candid self-examination in prose.",mi:"The essay as form; 'What do I know?'",inf:"Shakespeare, Emerson, all personal essayists and bloggers since"},
{id:42,t:"Meditations on First Philosophy",a:"René Descartes",y:1641,g:"Philosophy",p:100,c:"France",d:4,i:5,tg:["doubt","mind","certainty"],ds:"A thinker doubts everything that can possibly be doubted — and finds one unshakable foundation: I think, therefore I am.",w:"The starting gun of modern philosophy; the mind-body problem and the primacy of the thinking self begin here.",mi:"Methodological doubt; cogito ergo sum; mind-body dualism",inf:"All modern philosophy; cognitive science's founding questions"},
{id:43,t:"Leviathan",a:"Thomas Hobbes",y:1651,g:"Philosophy",p:730,c:"England",d:4,i:5,tg:["power","the state","human nature"],ds:"Written amid civil war: without a sovereign to fear, life is 'solitary, poor, nasty, brutish, and short.'",w:"Founded modern political philosophy — the idea that the state is a contract we make to escape chaos.",mi:"The state of nature; the social contract; sovereignty",inf:"Locke, Rousseau, all modern political theory"},
{id:44,t:"The Social Contract",a:"Jean-Jacques Rousseau",y:1762,g:"Philosophy",p:170,c:"France",d:3,i:5,tg:["freedom","democracy","the general will"],ds:"'Man is born free, and everywhere he is in chains' — an argument that legitimate power can come only from the people.",w:"The intellectual fuel of the French Revolution and of modern democracy's core claim: popular sovereignty.",mi:"The general will; legitimacy from consent",inf:"The French Revolution, democratic constitutions worldwide"},
{id:45,t:"Critique of Pure Reason",a:"Immanuel Kant",y:1781,g:"Philosophy",p:850,c:"Germany",d:5,i:5,tg:["knowledge","perception","reason"],ds:"An investigation of what the mind can and cannot know — arguing that the mind actively structures all experience.",w:"The 'Copernican revolution' in philosophy: we never see raw reality, only reality as our minds shape it.",mi:"The mind constructs experience; limits of pure reason",inf:"All philosophy since 1781; cognitive science; postmodern thought"},
{id:46,t:"Walden",a:"Henry David Thoreau",y:1854,g:"Philosophy",p:350,c:"United States",d:2,i:4,tg:["nature","simplicity","self-reliance"],ds:"A man builds a cabin by a pond and spends two years discovering how little a deliberate life requires.",w:"The founding text of American environmentalism and of every simplicity, minimalism, and 'opt out' movement since.",mi:"Deliberate living; nature as teacher; quiet resistance",inf:"Environmentalism, Gandhi and MLK (via 'Civil Disobedience'), minimalism"},
{id:47,t:"Beyond Good and Evil",a:"Friedrich Nietzsche",y:1886,g:"Philosophy",p:240,c:"Germany",d:4,i:5,tg:["morality","power","values"],ds:"A hammer taken to the foundations of morality: what if our values are symptoms, and 'good and evil' a human invention?",w:"Demolished the idea of objective morality and set the agenda for existentialism, psychology, and postmodernism.",mi:"Will to power; master and slave morality; perspectivism",inf:"Freud, existentialism, postmodernism, modern culture wars"},
{id:48,t:"The Myth of Sisyphus",a:"Albert Camus",y:1942,g:"Philosophy",p:210,c:"France",d:3,i:4,tg:["absurdity","meaning","suicide","revolt"],ds:"Beginning from 'the only truly serious philosophical problem' — suicide — Camus argues for revolt, freedom, and passion.",w:"The manifesto of the absurd: life has no given meaning, and that is precisely why we must live it fully.",mi:"The absurd; revolt as answer; 'one must imagine Sisyphus happy'",inf:"Existentialism, postwar literature, modern secular meaning-making"},
{id:49,t:"Elements",a:"Euclid",y:-300,g:"Science",p:500,c:"Greece",d:5,i:5,tg:["geometry","proof","logic"],ds:"All of geometry built up from five simple postulates, one airtight proof at a time.",w:"The most successful textbook ever written and the model of rigorous reasoning itself — Lincoln studied it to learn how to argue.",mi:"The axiomatic method; mathematical proof",inf:"Newton, Spinoza's Ethics, the structure of all mathematics"},
{id:50,t:"On the Revolutions of the Heavenly Spheres",a:"Nicolaus Copernicus",y:1543,g:"Science",p:400,c:"Poland",d:5,i:5,tg:["astronomy","heliocentrism","revolution"],ds:"A mathematical demonstration that the Earth is not the center of the universe — it moves around the Sun.",w:"Started the Scientific Revolution; 'Copernican' still means any idea that knocks humanity from the center of things.",mi:"Heliocentrism; mathematical astronomy",inf:"Galileo, Kepler, Newton — modern science itself"},
{id:51,t:"Dialogue Concerning the Two Chief World Systems",a:"Galileo Galilei",y:1632,g:"Science",p:500,c:"Italy",d:4,i:5,tg:["astronomy","evidence","heresy"],ds:"Three characters debate whether the Earth moves — a witty, devastating case for Copernicus that got its author tried by the Inquisition.",w:"The defining collision between scientific evidence and institutional authority; it made observation the judge of truth.",mi:"Evidence over authority; relativity of motion",inf:"The Scientific Revolution; science's independence from dogma"},
{id:52,t:"Principia Mathematica",a:"Isaac Newton",y:1687,g:"Science",p:500,c:"England",d:5,i:5,tg:["physics","gravity","laws of motion"],ds:"Three laws of motion and one law of gravitation, from which the movements of planets and cannonballs alike follow.",w:"Arguably the most important science book ever — it revealed a universe running on discoverable mathematical law.",mi:"Universal gravitation; a clockwork, law-governed cosmos",inf:"The Enlightenment, all physics, engineering, and spaceflight"},
{id:53,t:"On the Origin of Species",a:"Charles Darwin",y:1859,g:"Science",p:500,c:"England",d:3,i:5,tg:["evolution","natural selection","life"],ds:"Two decades of patient evidence for a single momentous idea: species change over time through natural selection.",w:"Transformed biology and humanity's understanding of its own origins — few books have changed thought more.",mi:"Natural selection; common descent; the tree of life",inf:"All modern biology, medicine, psychology, and much philosophy"},
{id:54,t:"Relativity: The Special and the General Theory",a:"Albert Einstein",y:1916,g:"Science",p:130,c:"Germany",d:4,i:5,tg:["physics","time","space"],ds:"Einstein explains, for general readers, why time slows, lengths shrink, and gravity is the curvature of spacetime.",w:"The theory that replaced Newton's absolute universe — written for the public by its own discoverer.",mi:"Spacetime; the relativity of simultaneity; E=mc²",inf:"Modern physics, cosmology, GPS, the atomic age"},
{id:55,t:"Silent Spring",a:"Rachel Carson",y:1962,g:"Science",p:380,c:"United States",d:2,i:5,tg:["environment","pesticides","ecology"],ds:"A meticulous, lyrical exposé of what pesticides were doing to birds, rivers, and human bodies.",w:"Launched the modern environmental movement; led to the EPA and the ban on DDT — one book, measurable planetary impact.",mi:"Ecological interconnection; science in the public interest",inf:"Environmentalism, the EPA, all environmental writing"},
{id:56,t:"The Structure of Scientific Revolutions",a:"Thomas S. Kuhn",y:1962,g:"Science",p:260,c:"United States",d:4,i:5,tg:["paradigms","progress","history of science"],ds:"Science doesn't advance smoothly — it lurches through crises and revolutions that replace one 'paradigm' with another.",w:"Gave the world 'paradigm shift' and permanently changed how we think about knowledge and progress.",mi:"Paradigms; normal science versus revolution; incommensurability",inf:"Philosophy of science, social sciences, business and tech culture"},
{id:57,t:"The Selfish Gene",a:"Richard Dawkins",y:1976,g:"Science",p:360,c:"England",d:3,i:4,tg:["evolution","genes","altruism"],ds:"Evolution seen from the gene's point of view: bodies are survival machines built by their replicators.",w:"Reframed evolutionary biology for a generation and coined 'meme' — the idea that ideas themselves evolve.",mi:"Gene-level selection; memes; the evolution of cooperation",inf:"Evolutionary psychology, internet culture ('memes'), popular science"},
{id:58,t:"Cosmos",a:"Carl Sagan",y:1980,g:"Science",p:380,c:"United States",d:2,i:4,tg:["astronomy","wonder","science literacy"],ds:"A tour of the universe and of the humans who dared to understand it, told with contagious wonder.",w:"The most successful work of science communication ever — it made a generation fall in love with the cosmos.",mi:"'We are made of star-stuff'; science as candle in the dark",inf:"Science communication; Neil deGrasse Tyson; public astronomy"},
{id:59,t:"A Brief History of Time",a:"Stephen Hawking",y:1988,g:"Science",p:210,c:"England",d:3,i:4,tg:["cosmology","black holes","time"],ds:"From the Big Bang to black holes: a physicist's attempt to explain the universe with only one equation.",w:"Brought cosmology to tens of millions of readers and made the deepest physics part of common culture.",mi:"Black hole radiation; the no-boundary universe",inf:"Popular cosmology; the public image of physics"},
{id:60,t:"The Interpretation of Dreams",a:"Sigmund Freud",y:1900,g:"Psychology",p:630,c:"Austria",d:4,i:5,tg:["the unconscious","dreams","desire"],ds:"Dreams, Freud argues, are the disguised fulfillment of hidden wishes — the royal road to the unconscious.",w:"Right or wrong, it created the modern idea that we are strangers to ourselves — with hidden depths that shape us.",mi:"The unconscious; wish fulfillment; dream symbolism",inf:"Psychotherapy, surrealism, film, advertising, everyday speech"},
{id:61,t:"Man's Search for Meaning",a:"Viktor E. Frankl",y:1946,g:"Psychology",p:165,c:"Austria",d:2,i:5,tg:["meaning","suffering","resilience"],ds:"A psychiatrist survives Auschwitz and reports what he learned: those who had a 'why' could bear almost any 'how.'",w:"One of the most life-changing books ever written; it founded meaning-centered therapy from inside history's darkest place.",mi:"Logotherapy; meaning as the primary human drive",inf:"Positive psychology, resilience research, millions of readers"},
{id:62,t:"Obedience to Authority",a:"Stanley Milgram",y:1974,g:"Psychology",p:220,c:"United States",d:3,i:4,tg:["obedience","ethics","experiments"],ds:"Ordinary volunteers, told to deliver electric shocks by a man in a lab coat, mostly kept going. Milgram explains why.",w:"The most famous — and unsettling — experiment in psychology; it changed how we understand atrocity and conformity.",mi:"The agentic state; situational power over character",inf:"Social psychology, research ethics, how we explain evil"},
{id:63,t:"Thinking, Fast and Slow",a:"Daniel Kahneman",y:2011,g:"Psychology",p:500,c:"United States",d:3,i:5,tg:["decision-making","bias","judgment"],ds:"A Nobel laureate maps the two systems of the mind — fast intuition and slow reason — and the predictable errors between them.",w:"The summa of behavioral science; it rewired how medicine, policy, and business think about human judgment.",mi:"System 1 / System 2; cognitive biases; prospect theory",inf:"Behavioral economics, nudge policy, evidence-based medicine"},
{id:64,t:"The Righteous Mind",a:"Jonathan Haidt",y:2012,g:"Psychology",p:420,c:"United States",d:2,i:4,tg:["morality","politics","intuition"],ds:"Why good people are divided by politics and religion: moral reasoning is the press secretary of moral intuition.",w:"The essential modern account of moral psychology and political polarization — intuition first, reasoning second.",mi:"Moral foundations theory; the rider and the elephant",inf:"Political psychology, civil-discourse movements"},
{id:65,t:"Flow",a:"Mihaly Csikszentmihalyi",y:1990,g:"Psychology",p:300,c:"United States",d:2,i:4,tg:["happiness","focus","optimal experience"],ds:"The best moments of life happen when we are fully absorbed in a challenge that stretches us — the state of flow.",w:"Named and mapped a universal human experience; foundational to positive psychology, game design, and modern work culture.",mi:"Flow; the balance of challenge and skill",inf:"Positive psychology, sports science, game and product design"},
{id:66,t:"Histories",a:"Herodotus",y:-430,g:"History",p:700,c:"Greece",d:4,i:5,tg:["Persia","inquiry","culture"],ds:"The war between Greece and Persia, plus everything Herodotus heard along the way — marvels, customs, and gossip included.",w:"The first work of history — 'inquiry' itself — and the first great work of cultural anthropology.",mi:"History as inquiry; the value of other cultures' stories",inf:"All historical writing; travel writing; anthropology"},
{id:67,t:"History of the Peloponnesian War",a:"Thucydides",y:-400,g:"History",p:550,c:"Greece",d:4,i:5,tg:["war","power","realism"],ds:"The war that destroyed golden-age Greece, analyzed without gods or myths: 'the strong do what they can, the weak suffer what they must.'",w:"The founding text of political realism; still assigned at war colleges and quoted in every great-power debate.",mi:"Power politics; history as rigorous analysis",inf:"International relations theory; the 'Thucydides Trap'"},
{id:68,t:"The Art of War",a:"Sun Tzu",y:-500,g:"History",p:100,c:"China",d:2,i:5,tg:["strategy","conflict","deception"],ds:"Thirteen spare chapters on strategy, whose first principle is that the supreme victory is winning without fighting.",w:"The most influential strategy text ever written — studied by generals, CEOs, and coaches for 2,500 years.",mi:"Winning without battle; know your enemy and yourself",inf:"Military doctrine, business strategy, game theory culture"},
{id:69,t:"The History of the Decline and Fall of the Roman Empire",a:"Edward Gibbon",y:1776,g:"History",p:1200,c:"England",d:5,i:4,tg:["Rome","empire","decline"],ds:"Thirteen centuries of Roman decline told in the most magnificent ironic prose in English historiography.",w:"Set the standard for narrative history and framed the question every great power still asks: why do empires fall?",mi:"Civilizational decline; history as literary art",inf:"All narrative history; endless 'decline of the West' debates"},
{id:70,t:"A People's History of the United States",a:"Howard Zinn",y:1980,g:"History",p:700,c:"United States",d:3,i:4,tg:["labor","dissent","perspective"],ds:"American history retold from the bottom up — through the eyes of workers, women, Native Americans, and the enslaved.",w:"Changed whose story counts as history; the most influential (and contested) work of popular history in America.",mi:"History from below; perspective shapes narrative",inf:"History education debates; popular and public history"},
{id:71,t:"Guns, Germs, and Steel",a:"Jared Diamond",y:1997,g:"History",p:480,c:"United States",d:3,i:4,tg:["geography","civilization","inequality"],ds:"Why did Eurasians conquer the world rather than the reverse? Diamond's answer: geography and biology, not biology of peoples.",w:"Reframed the biggest question in history around environment rather than race; launched the 'big history' genre.",mi:"Geographic determinism; the ultimate causes of inequality",inf:"Big history, Sapiens, popular social science"},
{id:72,t:"Sapiens",a:"Yuval Noah Harari",y:2011,g:"History",p:450,c:"Israel",d:2,i:4,tg:["human origins","myth","cooperation"],ds:"The whole human story in one arc: a species that conquered the world by believing in shared fictions.",w:"The defining big-ideas book of the 2010s; it made deep history a global conversation.",mi:"Shared myths enable mass cooperation; the cognitive revolution",inf:"Popular nonfiction, tech-world thinking, public discourse on AI"},
{id:73,t:"The Prince",a:"Niccolò Machiavelli",y:1532,g:"Politics",p:140,c:"Italy",d:2,i:5,tg:["power","statecraft","realism"],ds:"A ruthlessly practical manual for gaining and keeping power — it is better to be feared than loved, if you cannot be both.",w:"Founded political realism by describing politics as it is, not as it should be; 'Machiavellian' entered every language.",mi:"Politics divorced from morality; virtù and fortuna",inf:"All political science; strategy; the word itself"},
{id:74,t:"Common Sense",a:"Thomas Paine",y:1776,g:"Politics",p:80,c:"United States",d:2,i:5,tg:["independence","revolution","plain speech"],ds:"A 47-page pamphlet arguing, in language any farmer could read, that America must be independent — now.",w:"The best-selling work per capita in American history; it turned a colonial dispute into a revolution.",mi:"Plain-language political persuasion; republicanism for everyone",inf:"The American Revolution; political pamphleteering; op-eds"},
{id:75,t:"The Federalist Papers",a:"Hamilton, Madison & Jay",y:1788,g:"Politics",p:600,c:"United States",d:4,i:5,tg:["constitution","checks and balances","faction"],ds:"Eighty-five essays making the case for the U.S. Constitution — and explaining how to design power against human nature.",w:"The deepest owner's manual for constitutional democracy; courts still cite it to interpret the Constitution.",mi:"Checks and balances; controlling faction; federalism",inf:"Constitutional law, democratic design worldwide"},
{id:76,t:"Democracy in America",a:"Alexis de Tocqueville",y:1835,g:"Politics",p:900,c:"France",d:4,i:5,tg:["democracy","equality","civil society"],ds:"A young French aristocrat tours America and produces the most penetrating analysis of democracy ever written.",w:"Predicted democracy's strengths and pathologies — including tyranny of the majority and soft despotism — with uncanny accuracy.",mi:"Civil society; tyranny of the majority; individualism",inf:"Political science, sociology, every debate about American character"},
{id:77,t:"The Communist Manifesto",a:"Karl Marx & Friedrich Engels",y:1848,g:"Politics",p:50,c:"Germany",d:3,i:5,tg:["class struggle","capitalism","revolution"],ds:"'A spectre is haunting Europe' — a 50-page call to arms declaring all history the history of class struggle.",w:"Few documents have moved more of the world; it shaped a century of revolutions, states, and counter-movements.",mi:"Class struggle; historical materialism",inf:"World communism, labor movements, all critiques of capitalism"},
{id:78,t:"On Liberty",a:"John Stuart Mill",y:1859,g:"Politics",p:130,c:"England",d:3,i:5,tg:["freedom","speech","individuality"],ds:"The classic case that society may restrain an individual for one reason only: to prevent harm to others.",w:"The foundation of modern liberalism and of every free-speech argument you have ever heard.",mi:"The harm principle; the marketplace of ideas",inf:"Liberal democracy, First Amendment jurisprudence, civil liberties"},
{id:79,t:"The Souls of Black Folk",a:"W. E. B. Du Bois",y:1903,g:"Politics",p:270,c:"United States",d:3,i:5,tg:["race","identity","the color line"],ds:"Essays on Black life behind 'the Veil,' naming the problem of the twentieth century: the color line.",w:"Founded modern Black intellectual thought; 'double consciousness' remains essential for understanding identity in America.",mi:"Double consciousness; the Veil; the color line",inf:"The civil rights movement, sociology, African American studies"},
{id:80,t:"The Origins of Totalitarianism",a:"Hannah Arendt",y:1951,g:"Politics",p:700,c:"Germany",d:5,i:5,tg:["totalitarianism","loneliness","propaganda"],ds:"How Nazism and Stalinism became possible: antisemitism, imperialism, and masses of atomized, lonely people.",w:"The essential anatomy of totalitarianism — cited every time democracies wonder how the unthinkable begins.",mi:"Totalitarianism as novel form; loneliness as political condition",inf:"Political theory, Holocaust studies, contemporary democracy debates"},
{id:81,t:"The Wretched of the Earth",a:"Frantz Fanon",y:1961,g:"Politics",p:320,c:"Martinique",d:4,i:4,tg:["decolonization","violence","identity"],ds:"A psychiatrist in the Algerian revolution diagnoses what colonization does to minds — and what decolonization demands.",w:"The bible of decolonization movements across Africa, Asia, and the Americas.",mi:"Colonialism as psychological violence; national consciousness",inf:"Liberation movements worldwide; postcolonial theory"},
{id:82,t:"Orientalism",a:"Edward W. Said",y:1978,g:"Politics",p:400,c:"Palestine",d:4,i:4,tg:["representation","empire","knowledge"],ds:"How the West invented 'the Orient' — and how describing other peoples became a way of ruling them.",w:"Founded postcolonial studies; permanently changed how scholarship treats representation and power.",mi:"Knowledge as power; the constructed 'Other'",inf:"Postcolonial studies, media criticism, area studies"},
{id:83,t:"The Wealth of Nations",a:"Adam Smith",y:1776,g:"Economics",p:1000,c:"Scotland",d:4,i:5,tg:["markets","the invisible hand","labor"],ds:"How nations grow rich: division of labor, free exchange, and self-interest guided as if by an invisible hand.",w:"Founded economics as a discipline; the charter document of market capitalism.",mi:"The invisible hand; division of labor; free trade",inf:"All of economics; capitalism's self-understanding"},
{id:84,t:"Das Kapital",a:"Karl Marx",y:1867,g:"Economics",p:1100,c:"Germany",d:5,i:5,tg:["capital","labor","exploitation"],ds:"A monumental anatomy of capitalism arguing that profit is unpaid labor and crisis is built into the system.",w:"The most influential critique of capitalism ever written; it shaped the politics of the entire twentieth century.",mi:"Surplus value; commodity fetishism; capital accumulation",inf:"Socialist states and parties, labor law, critical theory"},
{id:85,t:"The General Theory of Employment, Interest and Money",a:"John Maynard Keynes",y:1936,g:"Economics",p:400,c:"England",d:5,i:5,tg:["recession","demand","government"],ds:"Written in the Depression: markets can stay broken, and governments can — must — spend to restore demand.",w:"Created macroeconomics and the modern policy playbook used in every recession from 1945 to COVID.",mi:"Aggregate demand; animal spirits; countercyclical policy",inf:"Central banking, stimulus policy, the postwar economic order"},
{id:86,t:"The Road to Serfdom",a:"Friedrich Hayek",y:1944,g:"Economics",p:270,c:"Austria",d:3,i:4,tg:["planning","freedom","markets"],ds:"A wartime warning that central economic planning, however well-meant, leads step by step toward tyranny.",w:"The intellectual cornerstone of modern free-market politics from Thatcher and Reagan onward.",mi:"Knowledge is dispersed; planning erodes liberty",inf:"Neoliberalism, libertarianism, Cold War economic debates"},
{id:87,t:"Capitalism and Freedom",a:"Milton Friedman",y:1962,g:"Economics",p:210,c:"United States",d:3,i:4,tg:["markets","freedom","policy"],ds:"The case that economic freedom is a precondition of political freedom — with policy ideas from vouchers to negative income tax.",w:"The most influential statement of postwar free-market economics; many of its 'radical' ideas became policy.",mi:"Economic freedom underpins political freedom; monetarism",inf:"Deregulation era, school choice, modern conservative economics"},
{id:88,t:"A Vindication of the Rights of Woman",a:"Mary Wollstonecraft",y:1792,g:"Feminism & Social Thought",p:330,c:"England",d:3,i:5,tg:["education","equality","reason"],ds:"If women seem frivolous, it is because they are educated to be — a demand that reason and education be extended to all.",w:"The founding text of feminist philosophy, written a full century before women could vote anywhere.",mi:"Women as rational beings; education as liberation",inf:"All feminist thought; Mill's The Subjection of Women; suffrage"},
{id:89,t:"A Room of One's Own",a:"Virginia Woolf",y:1929,g:"Feminism & Social Thought",p:110,c:"England",d:2,i:5,tg:["creativity","money","women writers"],ds:"Why has there been no female Shakespeare? Because genius requires money and a room of one's own — and women had neither.",w:"The essential essay on women and creative work; 'Shakespeare's sister' became a permanent thought experiment.",mi:"Material conditions of creativity; the woman writer's tradition",inf:"Feminist literary criticism; every conversation about art and access"},
{id:90,t:"The Second Sex",a:"Simone de Beauvoir",y:1949,g:"Feminism & Social Thought",p:800,c:"France",d:4,i:5,tg:["gender","existentialism","othering"],ds:"'One is not born, but rather becomes, a woman' — a vast existentialist analysis of woman as society's 'Other.'",w:"The intellectual foundation of second-wave feminism and of the sex/gender distinction itself.",mi:"Gender as social construction; woman as Other",inf:"Feminist theory, gender studies, Friedan and everyone after"},
{id:91,t:"The Feminine Mystique",a:"Betty Friedan",y:1963,g:"Feminism & Social Thought",p:340,c:"United States",d:2,i:5,tg:["domesticity","identity","work"],ds:"'The problem that has no name': the quiet desperation of educated women confined to postwar suburban domesticity.",w:"Ignited second-wave feminism in America; one of the rare books that visibly changed millions of lives within a decade.",mi:"The feminine mystique; identity beyond domestic roles",inf:"NOW, the women's movement, workplace equality"},
{id:92,t:"Gödel, Escher, Bach",a:"Douglas Hofstadter",y:1979,g:"Technology",p:780,c:"United States",d:5,i:4,tg:["consciousness","self-reference","AI","patterns"],ds:"A playful, dazzling braid of logic, art, and music exploring how meaning and minds emerge from meaningless symbols.",w:"The book that inspired a generation of AI researchers and programmers to ask how consciousness could arise from computation.",mi:"Strange loops; self-reference; emergence of mind",inf:"AI research culture, cognitive science, computer science education"},
{id:93,t:"The Autobiography of Benjamin Franklin",a:"Benjamin Franklin",y:1791,g:"Biography & Memoir",p:250,c:"United States",d:2,i:4,tg:["self-improvement","industry","virtue"],ds:"A printer's apprentice becomes scientist, statesman, and sage — and shares his famous system for self-improvement.",w:"The prototype of the American self-made story and the ancestor of every self-help book since.",mi:"Systematic self-improvement; the self-made ideal",inf:"Self-help genre, American identity, productivity culture"},
{id:94,t:"Narrative of the Life of Frederick Douglass",a:"Frederick Douglass",y:1845,g:"Biography & Memoir",p:130,c:"United States",d:2,i:5,tg:["slavery","literacy","freedom"],ds:"An enslaved man teaches himself to read, and reading teaches him that his enslavement is a lie he can escape.",w:"The most powerful firsthand indictment of American slavery; literacy as liberation, argued by living proof.",mi:"Literacy as the path from slavery to freedom",inf:"Abolitionism, American memoir, civil rights rhetoric"},
{id:95,t:"The Diary of a Young Girl",a:"Anne Frank",y:1947,g:"Biography & Memoir",p:300,c:"Netherlands",d:1,i:5,tg:["Holocaust","adolescence","hope"],ds:"A teenage girl records two years of hiding from the Nazis — funny, petty, profound, and unbearably human.",w:"The single most-read personal account of the Holocaust; it gave six million deaths one unforgettable voice.",mi:"The individual voice against mass atrocity",inf:"Holocaust memory and education worldwide"},
{id:96,t:"The Autobiography of Malcolm X",a:"Malcolm X & Alex Haley",y:1965,g:"Biography & Memoir",p:460,c:"United States",d:2,i:5,tg:["transformation","race","faith"],ds:"From street hustler to prison convert to world leader — a life of relentless self-transformation, told just before his assassination.",w:"One of the most important American autobiographies; it reshaped Black consciousness and the story of what change is possible.",mi:"Radical self-reinvention; dignity as demand",inf:"Black Power, hip-hop culture, American memoir"},
{id:97,t:"I Know Why the Caged Bird Sings",a:"Maya Angelou",y:1969,g:"Biography & Memoir",p:290,c:"United States",d:2,i:4,tg:["childhood","trauma","voice"],ds:"A Black girl in the segregated South survives trauma and silence — and finds her voice through literature.",w:"Transformed American memoir by telling truths about race, gender, and abuse that had never been said so openly.",mi:"Autobiography as literature and testimony",inf:"Modern memoir, especially by women and writers of color"},
{id:98,t:"Poetics",a:"Aristotle",y:-335,g:"Art & Creativity",p:50,c:"Greece",d:3,i:5,tg:["drama","story structure","catharsis"],ds:"The first systematic theory of storytelling: plot, character, reversal, recognition, and catharsis.",w:"Still the skeleton of screenwriting manuals 2,400 years later — beginnings, middles, ends, and tragic flaws start here.",mi:"Catharsis; plot as the soul of drama; mimesis",inf:"All dramatic theory; Hollywood story structure"},
{id:99,t:"The Hero with a Thousand Faces",a:"Joseph Campbell",y:1949,g:"Art & Creativity",p:420,c:"United States",d:3,i:4,tg:["myth","the hero's journey","archetypes"],ds:"Across every culture, Campbell finds one story: departure, initiation, return — the monomyth of the hero.",w:"George Lucas built Star Wars on it; the 'hero's journey' now structures half of Hollywood and most writing advice.",mi:"The monomyth; universal mythic structure",inf:"Star Wars, screenwriting, game narrative, self-development culture"},
{id:100,t:"Ways of Seeing",a:"John Berger",y:1972,g:"Art & Creativity",p:170,c:"England",d:2,i:4,tg:["images","advertising","the gaze"],ds:"Seven short essays on how we look at art — and how oil painting, publicity, and the male gaze train our eyes.",w:"Democratized art criticism and gave everyday viewers tools to decode images; 'men act and women appear' reshaped visual culture.",mi:"The male gaze (precursor); images as ideology",inf:"Media literacy, feminist art criticism, cultural studies"}
];

/* ---------- GAME CONSTANTS ---------- */
const LEVELS = [
  [0,"Curious Beginner"],[100,"Attentive Reader"],[250,"Margin Annotator"],[450,"Dedicated Bookworm"],
  [700,"Knowledge Explorer"],[1000,"Critical Thinker"],[1400,"Enlightenment Seeker"],[1900,"Salon Regular"],
  [2500,"Polymath in Training"],[3200,"Renaissance Mind"],[4200,"Keeper of Ideas"],[5400,"Modern Scholar"],
  [6800,"Master of the Stacks"],[8600,"Sage of Ages"],[11000,"Living Library"],[14000,"The Canon Complete"]
];

const XP = { start:10, q25:25, q50:25, done:100, reflect:20 };

const PATHS = [
  {id:"mind",name:"Build Your Mind",focus:"Philosophy · Psychology · Science · Decision-making",
   blurb:"Sharpen how you think. From Stoic self-command to modern cognitive science, this path traces 2,300 years of humans trying to understand their own minds — ordered so each book prepares you for the next.",
   books:[40,36,37,42,53,56,60,61,63,64,65,45]},
  {id:"humanity",name:"Understand Humanity",focus:"Literature · Human nature · Morality · Relationships",
   blurb:"The novel is a laboratory of the human heart. Begin with wit and social comedy, descend into conscience and guilt, and emerge with the full range of what people are capable of feeling and doing.",
   books:[12,14,27,16,18,23,25,28,29,61]},
  {id:"society",name:"Understand Society",focus:"Politics · Economics · History · Power",
   blurb:"Why do nations rise, markets crash, and revolutions eat their children? This path walks from Machiavelli's cold realism to the architecture of modern democracy and its discontents.",
   books:[73,74,83,77,76,78,79,85,80,72]},
  {id:"imagination",name:"Explore Creativity & Imagination",focus:"Epic · Drama · Myth · Invented worlds",
   blurb:"How stories are built and why they grip us. From the oldest quest ever told to the invention of cyberspace, with the theory of storytelling itself along the way.",
   books:[2,98,8,7,13,30,28,99,35,100]},
  {id:"rounded",name:"Become Well-Rounded",focus:"A balanced sample of every category",
   blurb:"One book from each corner of the canon, sequenced from friendly to formidable. Finish this path and you will have touched philosophy, science, politics, fiction, memoir, and art.",
   books:[40,2,73,12,53,68,89,94,60,83,30,100]}
];

/* explicit "read this next because…" links */
const LINKS = {
  30:[[31,"Both imagine total control — Orwell through fear and surveillance, Huxley through pleasure and distraction. Reading them together is the classic dystopia debate."],[24,"Kafka's faceless court is the nightmare Orwell systematized. See where the bureaucratic dread began."]],
  31:[[30,"The counterpart prophecy: where Huxley controls through pleasure, Orwell controls through pain. The two books complete each other."]],
  63:[[64,"Both explore how humans actually make judgments and why we misunderstand our own thinking — Kahneman on decisions, Haidt on morals."],[62,"Kahneman shows how judgment fails quietly; Milgram shows how it fails catastrophically under authority."]],
  12:[[18,"Both examine marriage, social expectation, and human complexity — Middlemarch is the epic-scale answer to Austen's drawing rooms."]],
  53:[[57,"Dawkins retells Darwin's idea from the gene's-eye view — the natural modern sequel."],[56,"Kuhn explains exactly the kind of scientific revolution Darwin's book caused."]],
  36:[[37,"From the teacher to the student: Aristotle answers Plato's ideal state with an ethics for real, flawed humans."]],
  20:[[25,"Achebe wrote Things Fall Apart partly in answer to Conrad — the same colonial encounter, seen from the other shore."]],
  2:[[21,"Joyce transplanted the Odyssey into one Dublin day. Read the original first and Ulysses becomes a treasure hunt."]],
  77:[[84,"The Manifesto is the pamphlet; Das Kapital is the full machinery behind it."],[83,"Read the system Marx was attacking — Smith's case for markets — and judge the argument from both sides."]],
  83:[[85,"Keynes is the great amendment to Smith: what happens when the invisible hand drops the ball."]],
  40:[[48,"From Stoic acceptance to absurdist revolt — two answers, eighteen centuries apart, to the same question of how to live."]],
  88:[[90,"From the founding demand for women's education to the full philosophical system: Beauvoir is Wollstonecraft's heir."]],
  90:[[91,"Friedan translated Beauvoir's philosophy into the book that mobilized a movement."]],
  13:[[31,"Shelley asked whether we should create life; Huxley answered what happens when we industrialize the process."]],
  8:[[16,"Hamlet's paralysis of conscience becomes Raskolnikov's crime — the two great anatomies of a guilty mind."]],
  73:[[43,"Machiavelli described princes as they are; Hobbes built the theory of why we need them at all."]],
  66:[[67,"From the father of history to the father of political analysis — Thucydides is the rigorous answer to Herodotus' wonder."]],
  61:[[95,"Two voices from the same catastrophe: Frankl's philosophy of meaning and Anne Frank's living diary."]],
  60:[[3,"Freud named his most famous theory after this play. See the source myth of psychoanalysis."]]
};

const ERAS = [
  {name:"The Ancient World", range:[-9999,499], sub:"c. 750 BC – 500 AD"},
  {name:"Medieval & Renaissance", range:[500,1599], sub:"500 – 1600"},
  {name:"Reason & Revolution", range:[1600,1799], sub:"1600 – 1800"},
  {name:"The Nineteenth Century", range:[1800,1899], sub:"1800 – 1900"},
  {name:"The Modern Crisis", range:[1900,1949], sub:"1900 – 1950"},
  {name:"The Postwar World", range:[1950,1979], sub:"1950 – 1980"},
  {name:"The Contemporary Canon", range:[1980,9999], sub:"1980 – today"}
];
const BRIDGES = [
  "Greek philosophy and epic set the questions the West still argues about →",
  "Ancient thought, rediscovered, ignites the Renaissance →",
  "Enlightenment ideas fuel political and scientific revolutions →",
  "Industry, evolution, and the realist novel remake the world →",
  "Two world wars force a reckoning with reason itself →",
  "Postwar voices widen the canon: decolonization, feminism, civil rights →"
];

const ACH_DEFS = [
  {id:"first",icon:"📖",name:"First Chapter",desc:"Start your first book",test:s=>s.anyStarted},
  {id:"pturner",icon:"🏁",name:"Page Turner",desc:"Finish your first book",test:s=>s.done>=1},
  {id:"phil",icon:"🏛️",name:"Philosopher",desc:"Finish 5 philosophy books",test:s=>(s.byGenre["Philosophy"]||0)>=5},
  {id:"sci",icon:"🔬",name:"Scientist",desc:"Finish 5 science books",test:s=>(s.byGenre["Science"]||0)>=5},
  {id:"novelist",icon:"🖋️",name:"Novel Mind",desc:"Finish 5 classic novels",test:s=>(s.byGenre["Classic Literature"]||0)>=5},
  {id:"ancient",icon:"🏺",name:"Ancient Voices",desc:"Finish 3 books written before year 1",test:s=>s.ancients>=3},
  {id:"speed",icon:"⚡",name:"Speed Reader",desc:"Finish a book within 7 days",test:s=>s.speedRead},
  {id:"deep",icon:"🌊",name:"Deep Thinker",desc:"Finish a difficulty-5 book",test:s=>s.hardDone},
  {id:"world",icon:"🌍",name:"World Citizen",desc:"Finish books from 10 countries",test:s=>s.countries>=10},
  {id:"streak7",icon:"🔥",name:"Steady Flame",desc:"Keep a 7-day reading streak",test:s=>s.bestStreak>=7},
  {id:"refl",icon:"💭",name:"Reflective Soul",desc:"Write 5 reflections",test:s=>s.reflections>=5},
  {id:"ren",icon:"🎨",name:"Renaissance Mind",desc:"Finish books from 10 categories",test:s=>s.genres>=10},
  {id:"half",icon:"⚖️",name:"Halfway There",desc:"Finish 50 of the 100",test:s=>s.done>=50},
  {id:"century",icon:"👑",name:"Century Club",desc:"Complete all 100 books",test:s=>s.done>=100}
];

/* ---------- HELPERS ---------- */
const fmtYear = y => y < 0 ? `c. ${Math.abs(y)} BC` : `${y}`;
const byId = Object.fromEntries(BOOKS.map(b=>[b.id,b]));
const todayStr = () => new Date().toISOString().slice(0,10);
const daysBetween = (a,b) => Math.round((new Date(b)-new Date(a))/86400000);

const EMPTY = { v:2, books:{}, xp:0, streak:{count:0,best:0,last:null}, path:null, goal:null };

function levelFor(xp){
  let idx=0; LEVELS.forEach(([t],i)=>{ if(xp>=t) idx=i; });
  const [curT]=LEVELS[idx]; const next=LEVELS[idx+1];
  return {n:idx+1,name:LEVELS[idx][1],cur:curT,next:next?next[0]:null,
    pct: next? Math.min(100,Math.round(100*(xp-curT)/(next[0]-curT))) : 100};
}

function Dots({n,of=5,label}){
  return <span className="dots" title={label} aria-label={label}>{Array.from({length:of},(_,i)=><i key={i} className={i<n?"f":""}/>)}</span>;
}

/* ---------- PROCEDURAL COVER SYSTEM ---------- */
const ERA_PALETTES=[
  {bg:"#1C1A2E",accent:"#7B6FA0",hi:"#C4B8E8"},   // ancient: deep violet
  {bg:"#1A2A1A",accent:"#5A7A3A",hi:"#A8C878"},    // classical: forest green
  {bg:"#2A1A0A",accent:"#8B5E2A",hi:"#D4A060"},    // medieval: burnt umber
  {bg:"#0A1E2A",accent:"#2A6A8A",hi:"#70C0D8"},    // renaissance: teal
  {bg:"#1E1A0A",accent:"#8A7020",hi:"#D4B840"},    // enlightenment: gold
  {bg:"#1A0A0A",accent:"#8A2A2A",hi:"#D47070"},    // industrial: oxblood
  {bg:"#0A1A1E",accent:"#1A6878",hi:"#60B8C8"},    // modern: steel blue
];
function eraFor(y){
  if(y<-200) return 0;
  if(y<400)  return 1;
  if(y<1500) return 2;
  if(y<1700) return 3;
  if(y<1850) return 4;
  if(y<1945) return 5;
  return 6;
}
const MOTIF_KEYS=["bolt","orbit","helix","waves","compass","leaf","weave","flame","crown","rays",
  "clash","scales","banner","lattice","columns","coin","scroll","mask","rings","eye","maze","fracture","hourglass","key"];
const THEME_MOTIF={
  freedom:"bolt",consciousness:"orbit",evolution:"helix",nature:"leaf",
  astronomy:"orbit",knowledge:"compass",war:"clash",justice:"scales",
  power:"crown",revolution:"flame",labor:"weave",morality:"scales",
  virtue:"scales",markets:"coin",love:"rings",memory:"hourglass",
  identity:"mask",fate:"hourglass",time:"hourglass",truth:"eye",
  reason:"compass",myth:"crown",satire:"mask",physics:"orbit",
  politics:"banner",society:"lattice",trauma:"fracture",mortality:"hourglass",
  education:"key",meaning:"rays",simplicity:"waves",realism:"waves",
  race:"clash",slavery:"clash",totalitarianism:"banner",
  "the everyday":"leaf",the_absurd:"maze",alienation:"maze",
};
function motifFor(b){
  for(const t of b.tg){ if(THEME_MOTIF[t]) return THEME_MOTIF[t]; }
  return MOTIF_KEYS[(b.id*7)%MOTIF_KEYS.length];
}
function Motif({k,w,h,c}){
  const x=w/2, y=h/2, s=Math.min(w,h)*0.38;
  const p={stroke:c,strokeWidth:1.4,fill:"none",strokeLinecap:"round"};
  switch(k){
    case"bolt":    return <polyline points={`${x-s*.3},${y-s} ${x+s*.1},${y-.1*s} ${x-s*.15},${y+.05*s} ${x+s*.35},${y+s}`} {...p}/>;
    case"orbit":   return <><ellipse cx={x} cy={y} rx={s} ry={s*.38} {...p}/><ellipse cx={x} cy={y} rx={s} ry={s*.38} transform={`rotate(60 ${x} ${y})`} {...p}/><ellipse cx={x} cy={y} rx={s} ry={s*.38} transform={`rotate(120 ${x} ${y})`} {...p}/><circle cx={x} cy={y} r={s*.12} fill={c}/></>;
    case"helix":   return <><path d={`M${x-s},${y-s} C${x+s},${y-s} ${x-s},${y+s} ${x+s},${y+s}`} {...p}/><path d={`M${x+s},${y-s} C${x-s},${y-s} ${x+s},${y+s} ${x-s},${y+s}`} {...p} strokeOpacity={.55}/></>;
    case"waves":   return <>{[-s*.5,-s*.15,s*.15,s*.5].map((dy,i)=><path key={i} d={`M${x-s},${y+dy} C${x-s*.4},${y+dy-s*.22} ${x+s*.4},${y+dy+s*.22} ${x+s},${y+dy}`} {...p} strokeOpacity={.4+i*.15}/>)}</>;
    case"compass": return <><circle cx={x} cy={y} r={s} {...p}/><line x1={x} y1={y-s} x2={x} y2={y+s} {...p}/><line x1={x-s} y1={y} x2={x+s} y2={y} {...p}/><polygon points={`${x},${y-s*.55} ${x-s*.18},${y+s*.2} ${x},${y} ${x+s*.18},${y+s*.2}`} fill={c}/></>;
    case"leaf":    return <><path d={`M${x},${y+s} C${x-s},${y} ${x-s},${y-s} ${x},${y-s} C${x+s},${y-s} ${x+s},${y} ${x},${y+s}`} {...p}/><line x1={x} y1={y+s} x2={x} y2={y-s} {...p}/></>;
    case"weave":   return <>{[[-s*.5,-s*.5],[s*.5,-s*.5],[-s*.5,s*.5],[s*.5,s*.5]].map(([dx,dy],i)=><circle key={i} cx={x+dx} cy={y+dy} r={s*.32} {...p} strokeOpacity={i%2===0?.9:.5}/>)}<line x1={x-s} y1={y} x2={x+s} y2={y} {...p} strokeOpacity={.35}/><line x1={x} y1={y-s} x2={x} y2={y+s} {...p} strokeOpacity={.35}/></>;
    case"flame":   return <path d={`M${x},${y+s} C${x-s*.5},${y} ${x-s*.3},${y-s*.4} ${x},${y-s} C${x+s*.2},${y-s*.5} ${x+s*.6},${y-s*.1} ${x+s*.4},${y+s*.3} C${x+s*.3},${y+s*.7} ${x},${y+s} ${x},${y+s}`} {...p}/>;
    case"crown":   return <polyline points={`${x-s},${y+s*.3} ${x-s},${y-s*.3} ${x-s*.5},${y+s*.1} ${x},${y-s*.6} ${x+s*.5},${y+s*.1} ${x+s},${y-s*.3} ${x+s},${y+s*.3}`} {...p}/>;
    case"rays":    return <>{[0,45,90,135].map(a=><><line key={`${a}a`} x1={x+Math.cos(a*Math.PI/180)*s*.15} y1={y+Math.sin(a*Math.PI/180)*s*.15} x2={x+Math.cos(a*Math.PI/180)*s} y2={y+Math.sin(a*Math.PI/180)*s} {...p}/><line key={`${a}b`} x1={x-Math.cos(a*Math.PI/180)*s*.15} y1={y-Math.sin(a*Math.PI/180)*s*.15} x2={x-Math.cos(a*Math.PI/180)*s} y2={y-Math.sin(a*Math.PI/180)*s} {...p}/></>)}<circle cx={x} cy={y} r={s*.13} fill={c}/></>;
    case"clash":   return <><line x1={x-s} y1={y-s} x2={x+s} y2={y+s} {...p}/><line x1={x+s} y1={y-s} x2={x-s} y2={y+s} {...p}/></>;
    case"scales":  return <><line x1={x} y1={y-s} x2={x} y2={y+s*.3} {...p}/><line x1={x-s*.8} y1={y-.1*s} x2={x+s*.8} y2={y-.1*s} {...p}/><path d={`M${x-s*.8},${y-.1*s} l${-s*.35},${s*.5} h${s*.7} Z`} {...p}/><path d={`M${x+s*.8},${y-.1*s} l${-s*.35},${s*.5} h${s*.7} Z`} {...p}/></>;
    case"banner":  return <><polyline points={`${x-s*.7},${y-s} ${x-s*.7},${y+s*.5} ${x},${y+s*.15} ${x+s*.7},${y+s*.5} ${x+s*.7},${y-s} ${x-s*.7},${y-s}`} {...p}/><line x1={x-s*.7} y1={y} x2={x+s*.7} y2={y} {...p} strokeOpacity={.4}/></>;
    case"lattice": return <>{[-1,0,1].flatMap(i=>[-1,0,1].map(j=><polygon key={`${i}${j}`} points={`${x+i*s*.5},${y+j*s*.5-s*.18} ${x+i*s*.5+s*.18},${y+j*s*.5} ${x+i*s*.5},${y+j*s*.5+s*.18} ${x+i*s*.5-s*.18},${y+j*s*.5}`} {...p} opacity={i===0&&j===0?1:.55}/>))}</>;
    case"columns": return <>{[-s*.5,-s*.17,s*.17,s*.5].map((dx,i)=><line key={i} x1={x+dx} y1={y-s} x2={x+dx} y2={y+s*.8} {...p}/>)}<line x1={x-s*.65} y1={y-s} x2={x+s*.65} y2={y-s} {...p}/><line x1={x-s*.65} y1={y+s*.8} x2={x+s*.65} y2={y+s*.8} {...p}/></>;
    case"coin":    return <><circle cx={x} cy={y} r={s} {...p}/><circle cx={x} cy={y} r={s*.65} {...p} strokeOpacity={.6}/></>;
    case"scroll":  return <><path d={`M${x-s*.3},${y-s} C${x-s*.7},${y-s} ${x-s*.7},${y+s} ${x-s*.3},${y+s} L${x+s*.3},${y+s} C${x+s*.7},${y+s} ${x+s*.7},${y-s} ${x+s*.3},${y-s} Z`} {...p}/>{[-s*.35,0,s*.35].map((dy,i)=><line key={i} x1={x-s*.4} y1={y+dy} x2={x+s*.4} y2={y+dy} {...p} strokeOpacity={.5}/>)}</>;
    case"mask":    return <><path d={`M${x},${y-s} C${x-s*.8},${y-s} ${x-s*.9},${y+s*.2} ${x},${y+s*.4} C${x+s*.9},${y+s*.2} ${x+s*.8},${y-s} ${x},${y-s}`} {...p}/><ellipse cx={x-s*.3} cy={y-.1*s} rx={s*.18} ry={s*.12} {...p}/><ellipse cx={x+s*.3} cy={y-.1*s} rx={s*.18} ry={s*.12} {...p}/></>;
    case"rings":   return <><circle cx={x-s*.25} cy={y} r={s*.55} {...p}/><circle cx={x+s*.25} cy={y} r={s*.55} {...p}/></>;
    case"eye":     return <><path d={`M${x-s},${y} C${x-s*.5},${y-s*.6} ${x+s*.5},${y-s*.6} ${x+s},${y} C${x+s*.5},${y+s*.6} ${x-s*.5},${y+s*.6} ${x-s},${y}`} {...p}/><circle cx={x} cy={y} r={s*.28} {...p}/><circle cx={x} cy={y} r={s*.1} fill={c}/></>;
    case"maze":    return <><rect x={x-s} y={y-s} width={s*2} height={s*2} {...p}/><polyline points={`${x-s*.5},${y-s} ${x-s*.5},${y-s*.3} ${x+s*.5},${y-s*.3} ${x+s*.5},${y+s*.3} ${x-s*.5},${y+s*.3} ${x-s*.5},${y+s}`} {...p} strokeOpacity={.7}/></>;
    case"fracture":return <><line x1={x} y1={y-s} x2={x-s*.2} y2={y} {...p}/><line x1={x-s*.2} y1={y} x2={x+s*.3} y2={y+s*.4} {...p}/><line x1={x+s*.3} y1={y+s*.4} x2={x-s*.1} y2={y+s} {...p}/><line x1={x-s*.2} y1={y} x2={x-s*.6} y2={y+s*.8} {...p} strokeOpacity={.5}/></>;
    case"hourglass":return <><polygon points={`${x-s*.7},${y-s} ${x+s*.7},${y-s} ${x},${y}`} {...p}/><polygon points={`${x-s*.7},${y+s} ${x+s*.7},${y+s} ${x},${y}`} {...p}/><line x1={x-s*.7} y1={y-s} x2={x-s*.7} y2={y+s} {...p} strokeOpacity={.35}/><line x1={x+s*.7} y1={y-s} x2={x+s*.7} y2={y+s} {...p} strokeOpacity={.35}/></>;
    case"key":     return <><circle cx={x-s*.25} cy={y} r={s*.42} {...p}/><line x1={x+s*.17} y1={y} x2={x+s*.9} y2={y} {...p}/><line x1={x+s*.6} y1={y} x2={x+s*.6} y2={y+s*.28} {...p}/><line x1={x+s*.82} y1={y} x2={x+s*.82} y2={y+s*.2} {...p}/></>;
    default:       return <circle cx={x} cy={y} r={s} {...p}/>;
  }
}
function Cover({b,big}){
  const w=big?92:64, h=big?136:94;
  const era=ERA_PALETTES[eraFor(b.y)];
  const motif=motifFor(b);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{borderRadius:"2px 5px 5px 2px",boxShadow:"3px 4px 10px rgba(0,0,0,.5)",flexShrink:0}}>
      <defs>
        <linearGradient id={`cg${b.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={era.bg}/>
          <stop offset="1" stopColor="#0e1612"/>
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill={`url(#cg${b.id})`}/>
      <rect x="4" y="0" width="1.5" height={h} fill="rgba(0,0,0,.35)"/>
      <rect x="1" y="0" width="1" height={h} fill={era.accent} opacity=".4"/>
      <g opacity=".18"><Motif k={motif} w={w} h={h} c={era.hi}/></g>
      <Motif k={motif} w={w} h={h-h*.3} c={era.accent}/>
      <rect x="0" y={h-20} width={w} height={20} fill="rgba(0,0,0,.45)"/>
      <text x={w/2} y={h-6} textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize={big?6.5:5.5} fill={era.hi} opacity=".85" letterSpacing="0.5">
        {b.y<0?`${Math.abs(b.y)} BC`:b.y} · {(()=>{const n=b.a.split(" ").slice(-1)[0].toUpperCase(); return n.length>8?n.slice(0,7)+"…":n;})()}
      </text>
    </svg>);
}

function Toasts({items}){
  return <div className="toaststack" aria-live="polite">{items.map(t=><div key={t.k} className="toast">{t.msg}</div>)}</div>;
}

/* ---------- SIGNATURE: THE SHELF ---------- */
function Shelf({st,onOpen}){
  const perRow = 25, rows=[];
  for(let r=0;r<4;r++) rows.push(BOOKS.slice(r*perRow,(r+1)*perRow));
  return (
    <div className="cq-card" style={{padding:"20px 14px 14px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",padding:"0 8px 10px"}}>
        <span className="cq-eyebrow">Your shelf · one spine per book</span>
        <span className="cq-mono" style={{fontSize:11,color:"var(--muted-text)"}}>
          <span style={{color:"var(--gilt)"}}>■</span> finished &nbsp;·&nbsp; ✦ reading &nbsp;·&nbsp; faint = awaiting you
        </span>
      </div>
      {rows.map((row,ri)=>(
        <React.Fragment key={ri}>
          <div className="shelfrow">
            {row.map(b=>{
              const rec=st.books[b.id]||{}; const status=rec.status||"todo";
              const h = 30 + Math.min(30, Math.round(b.p/45));
              return <button key={b.id} className={`spine ${status}`} title={`${b.t} — ${b.a}`}
                aria-label={`${b.t} by ${b.a}, ${status==="todo"?"not started":status}`}
                style={{height:h, background:GENRE_COLORS[b.g]}} onClick={()=>onOpen(b.id)}/>;
            })}
          </div>
          <div className="shelfboard"/>
        </React.Fragment>
      ))}
    </div>);
}

/* ---------- MAIN APP ---------- */
export default function CanonQuest(){
  const [st,setSt]=useState(EMPTY);
  const [loaded,setLoaded]=useState(false);
  const [tab,setTab]=useState("study");
  const [openId,setOpenId]=useState(null);
  const [toasts,setToasts]=useState([]);
  const tk=useRef(0), prevAch=useRef(null), saveT=useRef(null);

  /* load / save via persistent storage */
  useEffect(()=>{(async()=>{
    try{ const r=await Preferences.get({key:"cq-state"}); if(r&&r.value){ const p=JSON.parse(r.value); setSt({...EMPTY,...p}); } }
    catch(e){/* first visit */}
    setLoaded(true);
  })()},[]);
  useEffect(()=>{
    if(!loaded) return;
    clearTimeout(saveT.current);
    saveT.current=setTimeout(async()=>{ try{ await Preferences.set({key:"cq-state", value:JSON.stringify(st)}); }catch(e){console.error("save failed",e);} },500);
    return ()=>clearTimeout(saveT.current);
  },[st,loaded]);

  const toast=(msg)=>{ const k=++tk.current; setToasts(t=>[...t,{k,msg}]); setTimeout(()=>setToasts(t=>t.filter(x=>x.k!==k)),3400); };

  /* derived stats */
  const S=useMemo(()=>{
    const recs=st.books; let done=0,reading=0,pages=0,refl=0,anyStarted=false,speedRead=false,hardDone=false,ancients=0;
    const byGenre={},countries=new Set(),genres=new Set();
    BOOKS.forEach(b=>{
      const r=recs[b.id]; if(!r) return;
      if(r.status==="reading"){reading++;anyStarted=true;pages+=Math.min(r.pages||0,b.p);}
      if(r.status==="done"){
        done++;anyStarted=true;pages+=b.p;
        byGenre[b.g]=(byGenre[b.g]||0)+1; countries.add(b.c); genres.add(b.g);
        if(b.d===5)hardDone=true; if(b.y<1)ancients++;
        if(r.started&&r.finished&&daysBetween(r.started,r.finished)<=7)speedRead=true;
      }
      if(r.reflection&&r.reflection.trim())refl++;
    });
    return {done,reading,pages,hours:Math.round(pages*1.5/60),reflections:refl,anyStarted,speedRead,hardDone,ancients,
      byGenre,countries:countries.size,genres:genres.size,bestStreak:st.streak.best||0};
  },[st]);

  const achievements=useMemo(()=>ACH_DEFS.map(a=>({...a,earned:a.test(S)})),[S]);
  useEffect(()=>{
    const earned=new Set(achievements.filter(a=>a.earned).map(a=>a.id));
    if(prevAch.current){ earned.forEach(id=>{ if(!prevAch.current.has(id)){ const a=ACH_DEFS.find(x=>x.id===id); toast(`🏅 Achievement unlocked — ${a.name}`);} }); }
    prevAch.current=earned;
  },[achievements]);

  const lvl=levelFor(st.xp);

  /* core mutation with streak + XP */
  const update=(fn,activity)=>setSt(prev=>{
    const n=JSON.parse(JSON.stringify(prev)); const gains=[];
    if(activity){
      const t=todayStr(), s=n.streak;
      if(s.last!==t){
        const cont = s.last && daysBetween(s.last,t)===1;
        s.count = cont ? s.count+1 : 1; s.last=t; s.best=Math.max(s.best||0,s.count);
        if(s.count>1){ const bonus=Math.min(5*(s.count-1),25); n.xp+=bonus; gains.push(`🔥 ${s.count}-day streak +${bonus} XP`); }
      }
    }
    fn(n,gains);
    gains.forEach(g=>toast(g));
    return n;
  });

  const rec=(n,id)=>{ n.books[id]=n.books[id]||{status:"todo",pages:0,aw:{}}; return n.books[id]; };
  const give=(n,gains,key,amt,msg,r)=>{ if(!r.aw[key]){ r.aw[key]=1; n.xp+=amt; gains.push(msg); } };

  const startBook=id=>update((n,g)=>{ const r=rec(n,id); if(r.status==="todo"){ r.status="reading"; r.started=todayStr(); give(n,g,"start",XP.start,`＋${XP.start} XP — began “${byId[id].t}”`,r);} },true);
  const logPages=(id,pages)=>update((n,g)=>{
    const b=byId[id], r=rec(n,id); if(r.status!=="reading")return;
    const old=r.pages||0; const p=Math.max(0,Math.min(b.p,Math.round(pages))); r.pages=p;
    const dt=todayStr(); n.daily=n.daily||{}; if(p>old) n.daily[dt]=(n.daily[dt]||0)+(p-old);
    if(p/b.p>=.25) give(n,g,"q25",XP.q25,`＋${XP.q25} XP — a quarter through “${b.t}”`,r);
    if(p/b.p>=.5) give(n,g,"q50",XP.q50,`＋${XP.q50} XP — halfway through “${b.t}”`,r);
    if(p>=b.p) finishInner(n,g,id);
  },true);
  const finishInner=(n,g,id)=>{ const b=byId[id], r=rec(n,id);
    give(n,g,"q25",XP.q25,`＋${XP.q25} XP`,r); give(n,g,"q50",XP.q50,`＋${XP.q50} XP`,r);
    r.status="done"; r.pages=b.p; r.finished=r.finished||todayStr(); r.started=r.started||todayStr();
    give(n,g,"done",XP.done,`＋${XP.done} XP — finished “${b.t}”!`,r); };
  const finishBook=id=>update((n,g)=>finishInner(n,g,id),true);
  const unstartBook=id=>update(n=>{ const r=rec(n,id); r.status="todo"; r.started=null; r.pages=0; r.notes=""; r.quotes=""; });
  const unfinishBook=id=>update(n=>{ const r=rec(n,id); r.status="reading"; r.finished=null; });
  const saveField=(id,field,val)=>update(n=>{ const r=rec(n,id); r[field]=val; });
  const saveReflection=(id,val)=>update((n,g)=>{ const r=rec(n,id); r.reflection=val;
    if(val.trim()) give(n,g,"refl",XP.reflect,`＋${XP.reflect} XP — reflection saved`,r); });
  const setPath=pid=>update(n=>{ n.path = n.path===pid?null:pid; });
  const setGoal=goal=>update(n=>{ n.goal = goal ? {...goal, setAt: todayStr()} : null; });

  /* recommendation engine */
  const nextRec=useMemo(()=>{
    const doneIds=new Set(BOOKS.filter(b=>st.books[b.id]?.status==="done").map(b=>b.id));
    const readingIds=new Set(BOOKS.filter(b=>st.books[b.id]?.status==="reading").map(b=>b.id));
    const unread=b=>!doneIds.has(b.id)&&!readingIds.has(b.id);
    if(st.path){ const path=PATHS.find(p=>p.id===st.path);
      const nid=path.books.find(id=>!doneIds.has(id));
      if(nid&&!readingIds.has(nid)) return {b:byId[nid],why:`Next on your “${path.name}” path. ${byId[nid].w}`};
    }
    for(const id of doneIds){ const links=LINKS[id]||[];
      for(const [tid,reason] of links){ if(unread(byId[tid])) return {b:byId[tid],why:`Because you finished “${byId[id].t}”: ${reason}`}; } }
    if(doneIds.size===0&&readingIds.size===0) return {b:byId[40],why:"Short, profound, and personal — an emperor's private notes on how to live. The friendliest doorway into the canon."};
    const doneBooks=[...doneIds].map(i=>byId[i]);
    const tagCount={}; doneBooks.forEach(b=>b.tg.forEach(t=>tagCount[t]=(tagCount[t]||0)+1));
    const genresDone=new Set(doneBooks.map(b=>b.g));
    const avgD=doneBooks.length?doneBooks.reduce((a,b)=>a+b.d,0)/doneBooks.length:2;
    let best=null,bestScore=-1,bestWhy="";
    BOOKS.filter(unread).forEach(b=>{
      const shared=b.tg.filter(t=>tagCount[t]);
      let score=shared.length*2 + b.i + (genresDone.has(b.g)?1:1.6) - Math.abs(b.d-(avgD+0.4));
      if(score>bestScore){ bestScore=score; best=b;
        bestWhy = shared.length? `It deepens themes you've been drawn to — ${shared.slice(0,2).join(" and ")} — ${genresDone.has(b.g)?"in a genre you already love.":`while opening ${b.g} for you.`}`
          : `You haven't explored ${b.g} yet, and this is its ideal entry point. ${b.w}`; }
    });
    return best?{b:best,why:bestWhy}:null;
  },[st]);

  const quickPick=mode=>{
    const unread=BOOKS.filter(b=>!(st.books[b.id]?.status));
    let pick=null,why="";
    if(mode==="15"){ pick=[...unread].sort((a,b)=>(a.d-b.d)||(a.p-b.p))[0]; why="Short and welcoming — you can make real progress in fifteen minutes."; }
    if(mode==="challenge"){ pick=[...unread].sort((a,b)=>(b.d-a.d)||(b.p-a.p))[0]; why="One of the most demanding books on the list. Slow going, and worth every page."; }
    if(mode==="think"){ pick=[...unread].filter(b=>b.i===5).sort((a,b)=>a.d-b.d)[0]; why="Maximum influence per page — this one rearranges how you see the world."; }
    if(pick){ setOpenId(pick.id); toast(`📚 Suggested: “${pick.t}” — ${why}`); }
  };

  /* ---------- VIEWS ---------- */
  const pct=S.done; // out of 100
  const goalCard=()=>{
    const g=st.goal;
    const finishedThisMonth=BOOKS.filter(b=>{const r=st.books[b.id];return r?.status==="done"&&r.finished&&r.finished.slice(0,7)===todayStr().slice(0,7);}).length;
    const pagesToday=(st.daily||{})[todayStr()]||0;
    return (
      <div className="cq-card">
        <div className="cq-eyebrow" style={{marginBottom:10}}>Reading goal</div>
        {!g? (
          <div>
            <p style={{margin:"0 0 12px",color:"var(--muted-text)",fontSize:14}}>Choose a pace. The quest is long — a steady rhythm wins it.</p>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <button className="cq-btn sm" onClick={()=>setGoal({type:"monthly",label:"1 book a month"})}>1 book / month</button>
              <button className="cq-btn sm" onClick={()=>setGoal({type:"fiveyr",label:"All 100 in 5 years"})}>100 in 5 years</button>
              <button className="cq-btn sm" onClick={()=>setGoal({type:"pages",label:"20 pages a day"})}>20 pages / day</button>
            </div>
          </div>
        ):(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
              <strong className="cq-display" style={{fontWeight:500}}>{g.label}</strong>
              <button className="cq-btn sm ghost" onClick={()=>setGoal(null)}>Change</button>
            </div>
            <div style={{marginTop:10,fontSize:13.5,color:"var(--muted-text)"}}>
              {g.type==="monthly"&&(finishedThisMonth>=1
                ? <>✓ Goal met — <b style={{color:"var(--gilt)"}}>{finishedThisMonth}</b> finished this month. Ahead of pace.</>
                : <>Finish <b style={{color:"var(--gilt)"}}>1 book</b> this month. {S.reading? "You have one in progress — keep going.":"Start one below."}</>)}
              {g.type==="fiveyr"&&(()=>{const days=Math.max(1,daysBetween(g.setAt,todayStr()));const expected=Math.floor(days/18.25);const doneSince=S.done;
                return <>Pace needed: ~1 book every 18 days. Expected by now: <b>{expected}</b> · You: <b style={{color:doneSince>=expected?"var(--gilt)":"var(--oxblood)"}}>{doneSince}</b> {doneSince>=expected?"— on track.":"— time to pick one up."}</>;})()}
              {g.type==="pages"&&<>Today: <b style={{color:pagesToday>=20?"var(--gilt)":"var(--cream-text)"}}>{pagesToday}</b> / 20 pages {pagesToday>=20?"✓ done for today":""}
                <div className="cq-bar" style={{marginTop:8}}><i style={{width:`${Math.min(100,pagesToday/20*100)}%`}}/></div></>}
            </div>
          </div>
        )}
      </div>);
  };

  const Study=()=>{
    const readingBooks=BOOKS.filter(b=>st.books[b.id]?.status==="reading");
    const r=52, circ=2*Math.PI*r;
    return (
      <div>
        {/* Hero */}
        <div style={{display:"flex",gap:22,alignItems:"center",flexWrap:"wrap",padding:"30px 4px 6px"}}>
          <div className="levelring" role="img" aria-label={`Level ${lvl.n}, ${lvl.pct}% to next level`}>
            <svg width="118" height="118" viewBox="0 0 118 118">
              <circle cx="59" cy="59" r={r} fill="none" stroke="rgba(237,230,211,.1)" strokeWidth="7"/>
              <circle cx="59" cy="59" r={r} fill="none" stroke="url(#gg)" strokeWidth="7" strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={circ*(1-lvl.pct/100)} transform="rotate(-90 59 59)" style={{transition:"stroke-dashoffset .8s ease"}}/>
              <defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8F7638"/><stop offset="1" stopColor="#E2C070"/></linearGradient></defs>
            </svg>
            <div className="num"><span className="cq-mono" style={{fontSize:10,color:"var(--muted-text)",letterSpacing:2}}>LEVEL</span>
              <span className="cq-display" style={{fontSize:34,fontWeight:600,color:"var(--gilt)",lineHeight:1}}>{lvl.n}</span></div>
          </div>
          <div style={{flex:1,minWidth:230}}>
            <div className="cq-eyebrow">Your standing in the quest</div>
            <h1 className="cq-display" style={{margin:"4px 0 6px",fontSize:30,fontWeight:600,letterSpacing:.3}}>{lvl.name}</h1>
            <div className="cq-mono" style={{fontSize:12,color:"var(--muted-text)"}}>
              {st.xp.toLocaleString()} XP {lvl.next!==null && <> · {(lvl.next-st.xp).toLocaleString()} XP to “{LEVELS[lvl.n]? LEVELS[lvl.n][1]:""}”</>}
            </div>
            <div style={{marginTop:10,maxWidth:420}}>
              <div className="cq-bar"><i style={{width:`${pct}%`}}/></div>
              <div className="cq-mono" style={{fontSize:11,color:"var(--gilt)",marginTop:6}}>{S.done} / 100 books completed</div>
            </div>
          </div>
        </div>

        <div className="cq-grid-stats" style={{marginTop:18}}>
          {[[S.done,"Books finished"],[S.reading,"Now reading"],[st.streak.last===todayStr()||st.streak.count&&st.streak.last&&daysBetween(st.streak.last,todayStr())<=1?st.streak.count:0,"Day streak"],
            [S.pages.toLocaleString(),"Pages read"],[`~${S.hours}h`,"Reading hours"],[achievements.filter(a=>a.earned).length,"Badges earned"]].map(([v,l],i)=>
            <div key={i} className="cq-card cq-stat"><div className="v">{v}</div><div className="l">{l}</div></div>)}
        </div>

        <div className="cq-rule"><h2>The Shelf</h2></div>
        <Shelf st={st} onOpen={setOpenId}/>

        {readingBooks.length>0 && <>
          <div className="cq-rule"><h2>Currently reading</h2></div>
          <div style={{display:"grid",gap:10}}>
            {readingBooks.map(b=>{const r=st.books[b.id];const p=Math.round((r.pages||0)/b.p*100);
              return <div key={b.id} className="bookcard" onClick={()=>setOpenId(b.id)}>
                <Cover b={b}/>
                <div style={{flex:1,minWidth:0}}>
                  <div className="cq-display" style={{fontSize:17,fontWeight:500}}>{b.t}</div>
                  <div style={{fontSize:12.5,color:"var(--muted-text)"}}>{b.a} · {fmtYear(b.y)}</div>
                  <div style={{marginTop:10}}><div className="cq-bar"><i style={{width:`${p}%`}}/></div>
                  <div className="cq-mono" style={{fontSize:11,color:"var(--gilt)",marginTop:5}}>{r.pages||0} / {b.p} pages · {p}%</div></div>
                </div>
              </div>;})}
          </div>
        </>}

        {nextRec && <>
          <div className="cq-rule"><h2>Read this next</h2></div>
          <div className="cq-paper" style={{display:"flex",gap:18,padding:20,flexWrap:"wrap",cursor:"pointer"}} onClick={()=>setOpenId(nextRec.b.id)}>
            <Cover b={nextRec.b} big/>
            <div style={{flex:1,minWidth:220}}>
              <div className="cq-eyebrow" style={{color:"#8a6a1f"}}>Recommended for you</div>
              <div className="cq-display" style={{fontSize:22,fontWeight:600,margin:"3px 0"}}>{nextRec.b.t}</div>
              <div className="cq-mono" style={{fontSize:11.5,color:"var(--ink-soft)"}}>{nextRec.b.a} · {fmtYear(nextRec.b.y)} · {nextRec.b.p} pp</div>
              <p style={{fontSize:14.5,lineHeight:1.55,margin:"10px 0 12px"}}><em>Read this next because…</em> {nextRec.why}</p>
              <button className="cq-btn solid" onClick={e=>{e.stopPropagation();startBook(nextRec.b.id);setOpenId(nextRec.b.id);}}>Start reading</button>
            </div>
          </div>
        </>}

        <div className="cq-rule"><h2>What kind of session?</h2></div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <button className="qbtn" onClick={()=>quickPick("15")}><div className="qt">I only have 15 minutes</div><div className="qd">A short, welcoming book you can dent today</div></button>
          <button className="qbtn" onClick={()=>quickPick("challenge")}><div className="qt">I want a challenge</div><div className="qd">The mountains of the canon — long and demanding</div></button>
          <button className="qbtn" onClick={()=>quickPick("think")}><div className="qt">Change how I think</div><div className="qd">Maximum influence per page</div></button>
        </div>

        <div className="cq-rule"><h2>Goal</h2></div>
        {goalCard()}
      </div>);
  };

  /* ---------- LIBRARY VIEW ---------- */
  const [q,setQ]=useState("");
  const [fGenre,setFGenre]=useState("all");
  const [fDiff,setFDiff]=useState("all");
  const [fEra,setFEra]=useState("all");
  const [fLen,setFLen]=useState("all");
  const [fStatus,setFStatus]=useState("all");
  const [sort,setSort]=useState("influence");
  const [shuffleSeed,setShuffleSeed]=useState(0);

  const Library=()=>{
    const genres=[...new Set(BOOKS.map(b=>b.g))].sort();
    let list=BOOKS.filter(b=>{
      const rec=st.books[b.id]||{}; const status=rec.status||"todo";
      if(q && !(b.t+" "+b.a+" "+b.tg.join(" ")).toLowerCase().includes(q.toLowerCase())) return false;
      if(fGenre!=="all" && b.g!==fGenre) return false;
      if(fDiff!=="all" && b.d!==+fDiff) return false;
      if(fEra!=="all"){ const e=ERAS[+fEra]; if(b.y<e.range[0]||b.y>e.range[1]) return false; }
      if(fLen==="short" && b.p>250) return false;
      if(fLen==="medium" && (b.p<=250||b.p>500)) return false;
      if(fLen==="long" && b.p<=500) return false;
      if(fStatus!=="all" && status!==fStatus) return false;
      return true;
    });
    const sorters={
      influence:(a,b)=>b.i-a.i||a.d-b.d,
      oldest:(a,b)=>a.y-b.y, newest:(a,b)=>b.y-a.y,
      shortest:(a,b)=>a.p-b.p, longest:(a,b)=>b.p-a.p,
      random:(a,b)=>((a.id*2654435761+shuffleSeed)%1000)-((b.id*2654435761+shuffleSeed)%1000)
    };
    list=[...list].sort(sorters[sort]);
    const sel={minWidth:0};
    return (
      <div>
        <div className="cq-rule" style={{marginTop:26}}><h2>The Library · all 100 volumes</h2></div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
          <input className="cq-input" style={{flex:"1 1 180px"}} placeholder="Search title, author, theme…" value={q} onChange={e=>setQ(e.target.value)}/>
          <select className="cq-select" style={sel} value={fGenre} onChange={e=>setFGenre(e.target.value)}>
            <option value="all">All categories</option>{genres.map(g=><option key={g} value={g}>{g}</option>)}
          </select>
          <select className="cq-select" style={sel} value={fDiff} onChange={e=>setFDiff(e.target.value)}>
            <option value="all">Any difficulty</option>{[1,2,3,4,5].map(d=><option key={d} value={d}>Difficulty {d}</option>)}
          </select>
          <select className="cq-select" style={sel} value={fEra} onChange={e=>setFEra(e.target.value)}>
            <option value="all">Any era</option>{ERAS.map((e,i)=><option key={i} value={i}>{e.name}</option>)}
          </select>
          <select className="cq-select" style={sel} value={fLen} onChange={e=>setFLen(e.target.value)}>
            <option value="all">Any length</option><option value="short">Short (≤250 pp)</option><option value="medium">Medium (251–500)</option><option value="long">Long (500+)</option>
          </select>
          <select className="cq-select" style={sel} value={fStatus} onChange={e=>setFStatus(e.target.value)}>
            <option value="all">Any status</option><option value="todo">Not started</option><option value="reading">Reading</option><option value="done">Finished</option>
          </select>
          <select className="cq-select" style={sel} value={sort} onChange={e=>{setSort(e.target.value); if(e.target.value==="random") setShuffleSeed(Math.floor(Math.random()*99991));}}>
            <option value="influence">Most influential</option><option value="oldest">Oldest first</option><option value="newest">Newest first</option>
            <option value="shortest">Shortest first</option><option value="longest">Longest first</option><option value="random">Surprise me</option>
          </select>
        </div>
        <div className="cq-mono" style={{fontSize:11,color:"var(--muted-text)",marginBottom:12}}>{list.length} of 100 shown</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))",gap:12}}>
          {list.map(b=>{
            const rec=st.books[b.id]||{}; const status=rec.status||"todo";
            return (
              <div key={b.id} className="bookcard" onClick={()=>setOpenId(b.id)}>
                <Cover b={b}/>
                <div style={{flex:1,minWidth:0}}>
                  <div className="cq-display" style={{fontSize:16.5,fontWeight:500,lineHeight:1.25}}>{b.t}</div>
                  <div className="cq-mono" style={{fontSize:10.5,color:"var(--muted-text)",margin:"3px 0 6px"}}>{b.a} · {fmtYear(b.y)} · {b.p} pp · {b.c}</div>
                  <div style={{display:"flex",gap:14,fontSize:10.5}} className="cq-mono">
                    <span style={{color:"var(--muted-text)"}}>Difficulty <Dots n={b.d} label={`Difficulty ${b.d} of 5`}/></span>
                    <span style={{color:"var(--muted-text)"}}>Influence <Dots n={b.i} label={`Influence ${b.i} of 5`}/></span>
                  </div>
                  <div style={{margin:"7px 0 9px",display:"flex",gap:5,flexWrap:"wrap"}}>
                    {b.tg.map(t=><span key={t} className="tag">{t}</span>)}
                  </div>
                  {status==="todo" && <button className="cq-btn sm" onClick={e=>{e.stopPropagation();startBook(b.id);}}>Start reading</button>}
                  {status==="reading" && <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span className="cq-mono" style={{fontSize:10.5,color:"var(--gilt)"}}>✦ reading · {Math.round((rec.pages||0)/b.p*100)}%</span>
                    <button className="cq-btn sm" onClick={e=>{e.stopPropagation();finishBook(b.id);}}>Mark complete</button>
                  </div>}
                  {status==="done" && <span className="cq-mono" style={{fontSize:10.5,color:"var(--gilt)"}}>■ finished{rec.rating?` · ${"★".repeat(rec.rating)}`:""}</span>}
                </div>
              </div>);
          })}
        </div>
      </div>);
  };

  /* ---------- PATHS VIEW ---------- */
  const Paths=()=>{
    const active=PATHS.find(p=>p.id===st.path);
    return (
      <div>
        <div className="cq-rule" style={{marginTop:26}}><h2>Reading paths · guided routes through the canon</h2></div>
        <p style={{fontSize:14,color:"var(--muted-text)",maxWidth:640,margin:"0 0 16px"}}>
          A path is a curated sequence, ordered so each book prepares you for the next. Choose one to guide your recommendations — switch or abandon it any time without losing progress.
        </p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
          {PATHS.map(p=>{
            const doneN=p.books.filter(id=>st.books[id]?.status==="done").length;
            return (
              <div key={p.id} className={`pathcard${st.path===p.id?" active":""}`} onClick={()=>setPath(p.id)}>
                <div className="cq-eyebrow" style={{color:"var(--gilt)"}}>{p.focus}</div>
                <div className="cq-display" style={{fontSize:20,fontWeight:600,margin:"5px 0 8px"}}>{p.name}</div>
                <p style={{fontSize:13.5,lineHeight:1.55,color:"var(--muted-text)",margin:"0 0 12px"}}>{p.blurb}</p>
                <div className="cq-bar"><i style={{width:`${Math.round(100*doneN/p.books.length)}%`}}/></div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:8,alignItems:"center"}}>
                  <span className="cq-mono" style={{fontSize:10.5,color:"var(--gilt)"}}>{doneN} / {p.books.length} read</span>
                  <span className="cq-mono" style={{fontSize:10.5,color:st.path===p.id?"var(--gilt)":"var(--muted-text)"}}>{st.path===p.id?"✦ ACTIVE — tap to leave":"tap to follow"}</span>
                </div>
              </div>);
          })}
        </div>
        {active && <>
          <div className="cq-rule"><h2>Your route · {active.name}</h2></div>
          <div style={{display:"grid",gap:8}}>
            {active.books.map((id,i)=>{
              const b=byId[id]; const rec=st.books[id]||{}; const status=rec.status||"todo";
              return (
                <div key={id} className="bookcard" style={{alignItems:"center"}} onClick={()=>setOpenId(id)}>
                  <div className="cq-mono" style={{fontSize:13,color:status==="done"?"var(--gilt)":"var(--muted-text)",width:26,textAlign:"center"}}>
                    {status==="done"?"■":status==="reading"?"✦":i+1}
                  </div>
                  <Cover b={b}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div className="cq-display" style={{fontSize:16,fontWeight:500}}>{b.t}</div>
                    <div className="cq-mono" style={{fontSize:10.5,color:"var(--muted-text)",margin:"2px 0 5px"}}>{b.a} · {fmtYear(b.y)} · difficulty {b.d}/5</div>
                    <div style={{fontSize:13,color:"var(--muted-text)",lineHeight:1.5}}><em>Why it's here:</em> {b.w}</div>
                  </div>
                </div>);
            })}
          </div>
        </>}
      </div>);
  };

  /* ---------- TIMELINE VIEW ---------- */
  const Timeline=()=>(
    <div>
      <div className="cq-rule" style={{marginTop:26}}><h2>The river of ideas · 2,700 years in seven chapters</h2></div>
      <p style={{fontSize:14,color:"var(--muted-text)",maxWidth:640,margin:"0 0 16px"}}>
        Scroll sideways to walk the whole canon in time. Each caption between eras names the current that carried ideas from one age into the next. Tap any book to open it.
      </p>
      <div style={{display:"flex",gap:0,overflowX:"auto",paddingBottom:14,alignItems:"stretch"}}>
        {ERAS.map((e,i)=>{
          const eraBooks=BOOKS.filter(b=>b.y>=e.range[0]&&b.y<=e.range[1]).sort((a,b)=>a.y-b.y);
          return (
            <React.Fragment key={e.name}>
              <div className="era">
                <div className="cq-eyebrow">{e.sub}</div>
                <h4>{e.name}</h4>
                <div className="cq-mono" style={{fontSize:10,color:"var(--muted-text)",marginBottom:4}}>{eraBooks.length} books</div>
                {eraBooks.map(b=>{
                  const status=(st.books[b.id]||{}).status||"todo";
                  return (
                    <button key={b.id} className="chip" onClick={()=>setOpenId(b.id)} style={status==="done"?{borderColor:"rgba(200,162,75,.55)"}:null}>
                      <span className="sq" style={{background:GENRE_COLORS[b.g],opacity:status==="todo"?.45:1}}/>
                      <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{fmtYear(b.y)} · {b.t}</span>
                    </button>);
                })}
              </div>
              {i<ERAS.length-1 && <div className="bridge"><b>⟶</b>{BRIDGES[i]}</div>}
            </React.Fragment>);
        })}
      </div>
    </div>);

  /* ---------- HONORS VIEW ---------- */
  const Honors=()=>(
    <div>
      <div className="cq-rule" style={{marginTop:26}}><h2>Honors · {achievements.filter(a=>a.earned).length} of {ACH_DEFS.length} earned</h2></div>
      <div style={{display:"flex",gap:18,flexWrap:"wrap",padding:"8px 2px"}}>
        {achievements.map(a=>(
          <div key={a.id} className={`cq-badge${a.earned?"":" locked"}`} title={a.desc}>
            <div className="medal">{a.icon}</div>
            <div className="bn">{a.name}</div>
            <div className="bd">{a.desc}</div>
          </div>))}
      </div>
      <div className="cq-rule"><h2>The ledger</h2></div>
      <div className="cq-card" style={{padding:18}}>
        <div className="cq-mono" style={{fontSize:12,color:"var(--muted-text)",lineHeight:2}}>
          Start a book — ＋{XP.start} XP<br/>Reach 25% — ＋{XP.q25} XP · Reach 50% — ＋{XP.q50} XP<br/>
          Finish a book — ＋{XP.done} XP · Write a reflection — ＋{XP.reflect} XP<br/>
          Daily streak — up to ＋25 XP per day of momentum
        </div>
      </div>
    </div>);

  /* ---------- BOOK DETAIL MODAL ---------- */
  const BookDetail=()=>{
    const b=byId[openId]; if(!b) return null;
    const rec=st.books[b.id]||{}; const status=rec.status||"todo";
    const related=(LINKS[b.id]||[]).map(([id,why])=>({b:byId[id],why}));
    return (
      <div className="modalveil" onClick={()=>setOpenId(null)}>
        <div className="modal cq-paper" onClick={e=>e.stopPropagation()} role="dialog" aria-modal="true" aria-label={b.t}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(60,50,30,.15)",marginBottom:14,paddingBottom:10}}>
            <span className="cq-mono" style={{fontSize:10,letterSpacing:1.5,color:"#8a6a1f",textTransform:"uppercase"}}>Book detail</span>
            <button onClick={()=>setOpenId(null)} style={{background:"#2a2010",color:"#F1EADA",border:"none",borderRadius:4,padding:"7px 16px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,fontWeight:600,cursor:"pointer",letterSpacing:".5px"}}>✕ Close</button>
          </div>
          <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
            <Cover b={b} big/>
            <div style={{flex:1,minWidth:230}}>
              <div className="cq-eyebrow" style={{color:"#8a6a1f"}}>{b.g}</div>
              <h2 className="cq-display" style={{fontSize:26,fontWeight:600,margin:"3px 0 4px"}}>{b.t}</h2>
              <div className="cq-mono" style={{fontSize:12,color:"#5d5342"}}>{b.a} · {fmtYear(b.y)} · {b.c} · {b.p} pages</div>
              <div style={{display:"flex",gap:18,margin:"9px 0 7px",fontSize:11.5}} className="cq-mono">
                <span style={{color:"#5d5342"}}>Difficulty <Dots n={b.d} label={`Difficulty ${b.d} of 5`}/></span>
                <span style={{color:"#5d5342"}}>Influence <Dots n={b.i} label={`Influence ${b.i} of 5`}/></span>
              </div>
              <div>{b.tg.map(t=><span key={t} className="tag" style={{borderColor:"rgba(60,50,30,.3)",color:"#5d5342"}}>{t}</span>)}</div>
            </div>
          </div>

          <p style={{fontSize:15,lineHeight:1.6,margin:"14px 0 4px"}}>{b.ds}</p>
          <h3 className="cq-display" style={{fontSize:15,fontWeight:600,margin:"14px 0 4px",color:"#7a5c1c"}}>Why this book matters</h3>
          <p style={{fontSize:14.5,lineHeight:1.6,margin:0}}>{b.w}</p>
          <h3 className="cq-display" style={{fontSize:15,fontWeight:600,margin:"14px 0 4px",color:"#7a5c1c"}}>Major ideas</h3>
          <p style={{fontSize:14.5,lineHeight:1.6,margin:0}}>{b.mi}</p>
          <h3 className="cq-display" style={{fontSize:15,fontWeight:600,margin:"14px 0 4px",color:"#7a5c1c"}}>What it influenced</h3>
          <p style={{fontSize:14.5,lineHeight:1.6,margin:0}}>{b.inf}</p>

          {related.length>0 && <>
            <h3 className="cq-display" style={{fontSize:15,fontWeight:600,margin:"16px 0 6px",color:"#7a5c1c"}}>Reads in conversation with</h3>
            {related.map(r=>(
              <p key={r.b.id} style={{fontSize:13.5,lineHeight:1.55,margin:"0 0 8px"}}>
                <a href="#" onClick={e=>{e.preventDefault();setOpenId(r.b.id);}} style={{color:"#7a5c1c",fontWeight:600}}>{r.b.t}</a> — {r.why}
              </p>))}
          </>}

          <div style={{borderTop:"1px solid rgba(60,50,30,.2)",marginTop:16,paddingTop:14}}>
            {status==="todo" && <button className="cq-btn solid" onClick={()=>startBook(b.id)}>Start reading — ＋{XP.start} XP</button>}

            {status==="reading" && <>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6,flexWrap:"wrap",gap:6}}>
                <div className="cq-eyebrow" style={{color:"#8a6a1f"}}>Reading tracker · {rec.pages||0} / {b.p} pages ({Math.round((rec.pages||0)/b.p*100)}%)</div>
                <button className="cq-btn sm ghost" style={{fontSize:11,padding:"4px 10px",borderColor:"rgba(60,50,30,.3)",color:"#8a6a1f"}}
                  onClick={()=>{ if(window.confirm("Remove this book from your reading list? Your notes will be cleared.")) unstartBook(b.id); }}>↩ Not started</button>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginBottom:10}}>
                <input className="cq-input" type="number" min="0" max={b.p} defaultValue={rec.pages||0} key={`pg-${b.id}-${rec.pages||0}`}
                  style={{width:110,background:"#fff",color:"#2a2418",borderColor:"rgba(60,50,30,.35)"}}
                  onKeyDown={e=>{if(e.key==="Enter")logPages(b.id,+e.target.value);}}
                  onBlur={e=>{if(+e.target.value!==(rec.pages||0))logPages(b.id,+e.target.value);}}/>
                <span className="cq-mono" style={{fontSize:10.5,color:"#5d5342"}}>update page · Enter to log</span>
                <button className="cq-btn sm" style={{marginLeft:"auto"}} onClick={()=>finishBook(b.id)}>Mark complete — ＋{XP.done} XP</button>
              </div>
              <div className="cq-eyebrow" style={{color:"#8a6a1f",margin:"10px 0 4px"}}>Notes</div>
              <textarea className="cq-input" rows="3" defaultValue={rec.notes||""} key={`nt-${b.id}`} placeholder="Thoughts as you go…"
                style={{background:"#fff",color:"#2a2418",borderColor:"rgba(60,50,30,.35)"}} onBlur={e=>saveField(b.id,"notes",e.target.value)}/>
              <div className="cq-eyebrow" style={{color:"#8a6a1f",margin:"10px 0 4px"}}>Passages worth keeping</div>
              <textarea className="cq-input" rows="3" defaultValue={rec.quotes||""} key={`qt-${b.id}`} placeholder="Copy lines you want to remember…"
                style={{background:"#fff",color:"#2a2418",borderColor:"rgba(60,50,30,.35)"}} onBlur={e=>saveField(b.id,"quotes",e.target.value)}/>
            </>}

            {status==="done" && <>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4,flexWrap:"wrap",gap:6}}>
                <div className="cq-eyebrow" style={{color:"#8a6a1f"}}>Finished {rec.finished||""} — well read.</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  <button className="cq-btn sm ghost" style={{fontSize:11,padding:"4px 10px",borderColor:"rgba(60,50,30,.3)",color:"#8a6a1f"}}
                    onClick={()=>unfinishBook(b.id)}>↩ Still reading</button>
                  <button className="cq-btn sm ghost" style={{fontSize:11,padding:"4px 10px",borderColor:"rgba(60,50,30,.3)",color:"#8a6a1f"}}
                    onClick={()=>{ if(window.confirm("Reset this book to not started? Your notes, rating, and reflection will be cleared.")) unstartBook(b.id); }}>↩ Not started</button>
                </div>
              </div>
              <div className="starrow" style={{margin:"6px 0 4px"}} role="radiogroup" aria-label="Your rating">
                {[1,2,3,4,5].map(n=><button key={n} className={rec.rating>=n?"on":""} aria-label={`${n} stars`}
                  onClick={()=>saveField(b.id,"rating",n)}>★</button>)}
                <span className="cq-mono" style={{fontSize:10.5,color:"#5d5342",alignSelf:"center",marginLeft:6}}>{rec.rating?`${rec.rating}/5`:"← tap to rate"}</span>
              </div>
              <div className="cq-eyebrow" style={{color:"#8a6a1f",margin:"10px 0 4px"}}>Reflection — what did this book change about how you see the world?</div>
              <textarea className="cq-input" rows="4" defaultValue={rec.reflection||""} key={`rf-${b.id}`}
                placeholder={`One honest paragraph is worth ＋${XP.reflect} XP…`}
                style={{background:"#fff",color:"#2a2418",borderColor:"rgba(60,50,30,.35)"}} onBlur={e=>saveReflection(b.id,e.target.value)}/>
              {(rec.notes||rec.quotes) && <>
                {rec.notes && <><div className="cq-eyebrow" style={{color:"#8a6a1f",margin:"10px 0 4px"}}>Your notes</div><p style={{fontSize:13.5,whiteSpace:"pre-wrap",margin:0}}>{rec.notes}</p></>}
                {rec.quotes && <><div className="cq-eyebrow" style={{color:"#8a6a1f",margin:"10px 0 4px"}}>Saved passages</div><p style={{fontSize:13.5,whiteSpace:"pre-wrap",fontStyle:"italic",margin:0}}>{rec.quotes}</p></>}
              </>}
            </>}
          </div>
        </div>
      </div>);
  };

  /* ---------- RENDER ---------- */
  if(!loaded) return (
    <div className="cq-root"><style>{FONTS_AND_CSS}</style>
      <div className="cq-wrap" style={{paddingTop:80,textAlign:"center"}}>
        <div className="cq-display" style={{fontSize:22,color:"var(--gilt)"}}>Opening the library…</div>
      </div>
    </div>);

  const TABS=[["study","Study"],["library","Library"],["paths","Paths"],["timeline","Timeline"],["honors","Honors"]];
  return (
    <div className="cq-root">
      <style>{FONTS_AND_CSS}</style>
      <div className="cq-wrap">
        <nav className="cq-nav">
          <div className="cq-brand">The Canon Quest <small>· 100 books that shaped the world</small></div>
          <div style={{flex:1}}/>
          {TABS.map(([id,label])=>
            <button key={id} className={`cq-tab${tab===id?" active":""}`} onClick={()=>setTab(id)}>{label}</button>)}
        </nav>
        {tab==="study"&&<Study/>}
        {tab==="library"&&<Library/>}
        {tab==="paths"&&<Paths/>}
        {tab==="timeline"&&<Timeline/>}
        {tab==="honors"&&<Honors/>}
      </div>
      {openId!==null && <BookDetail/>}
      <Toasts items={toasts}/>
    </div>);
}
