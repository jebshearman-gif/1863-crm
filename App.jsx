import { useState, useEffect, useCallback, useMemo } from "react";
import { sGet, sSet, supabase } from "./supabase.js";
import { useRole, UserManagementPanel } from "./RoleContext.jsx";

// 1863 Design C palette: Orange #f58c30 | Deep navy #054760 | Near-black #040c14
const T = {
  bg:"#040c14", panel:"#0a1a24", border:"#143044",
  gold:"#f58c30", goldDim:"rgba(245,140,48,0.12)",
  text:"#e8edf0", muted:"#4a6475", dim:"#0d2030",
  green:"#4ade80", greenDim:"#071a0f", greenBorder:"#166534",
  amber:"#fbbf24", amberDim:"#1c1505", amberBorder:"#78350f",
  red:"#f87171", redDim:"#1a0707", redBorder:"#7f1d1d",
  blue:"#52aaec", blueDim:"#051a30",
};

const POS_COLOR = {
  GK:"#6d28d9",LB:"#1d4ed8",RB:"#1e40af",CB:"#0369a1",
  DM:"#0f766e",CM:"#047857",AM:"#b45309",LW:"#c2410c",RW:"#b91c1c",ST:"#991b1b"
};

// sGet and sSet are imported from ./supabase.js
function uid() { return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
function today() { return new Date().toLocaleDateString("en-GB"); }

const SEED_PLAYERS = [
  {id:"csv_10",name:"Martin Dubravka",dob:"15/01/1989",nationality:"Slovakia",currentClub:"Burnley",position:"GK",foot:"Right",height:"1.91m",weight:"85kg",international:"60 caps",transferFee:"TBC",contractExpiry:"30/06/2026",description:"Martin is one of the most experienced goalkeepers in the Premier League, now playing for Burnley after joining from Newcastle on 7 August 2025. He kept 54 clean sheets in 179 appearances for Newcastle and has made over 400 senior career appearances across all clubs. He displays excellent reflexes and world class shot stopping combined with commanding decision making. He dominates his box and is capable of launching counter attacks with accurate distribution. He has Europa League and Champions League experience and is Slovakia's first choice goalkeeper.",notes:"2025/26 (Burnley, PL): 31 appearances, 3 clean sheets, 111 saves. Joined Burnley on 7 August 2025 replacing James Trafford (sold to Man City for £31m). Won North East Football Writers Player of Year 2018, Newcastle Player of Year 2019/20. Slovakia number 1, started every game at Euro 2024. Agent: 1863.",technical:{score:8,notes:"Elite shot stopper, excellent distribution with hands and feet"},tactical:{score:8,notes:"Commanding presence, controls box, sweeps effectively"},physical:{score:7,notes:"1.91m, strong aerial command"},mental:{score:9,notes:"World class communicator, leader on the pitch"},leagueQuality:{level:"Elite",notes:"Premier League (Burnley). Previously Newcastle United.",eciRanking:"",eloRanking:""},recommendation:{verdict:"PLACED",priority:"HIGH",suitableMarket:"Premier League",rationale:"Premier League GK now at Burnley. Active 1863 client.",clubRecommendations:[]},videoUrl:"https://vimeo.com/926370930/d9c04994a1?share=copy",transfermarktUrl:"https://www.transfermarkt.co.uk/martin-dubravka/profil/spieler/74960",fbrefUrl:"",status:"Signed",source:"1863 Player",addedBy:"Tony Verinder",dateAdded:"01/02/2026"},
  {id:"csv_11",name:"Baba Rahman",dob:"02/07/1994",nationality:"Ghana",currentClub:"PAOK",position:"LB",foot:"Left",height:"1.79m",weight:"70kg",international:"51 caps, 1 goal, 8 assists",transferFee:"TBC",contractExpiry:"30/06/2026",description:"Baba is an experienced left back who plays for PAOK in the Greek Super League. He was instrumental in PAOK's Greek title win last season and has been the best left back in the Greek Super League over the last 18 months. He displays impressive athleticism with natural pace, agility and technical ability. He has 16 goals and 9 assists for PAOK across all competitions and has made over 300 senior appearances in total. In 2025/26 he has scored 1 goal and provided 1 assist from full back.",notes:"Previously at Chelsea (£25m fee), Schalke, Augsburg, Mallorca and Stade Reims. Played at World Cup Qatar 2022. Also won the Greek Cup. Has vast experience across Europe's big 5 leagues.",technical:{score:7,notes:"Strong technical ability, good delivery from wide areas"},tactical:{score:7,notes:"Intelligent runs, strong defensive awareness and positioning"},physical:{score:8,notes:"Natural pace, agility, athleticism"},mental:{score:7,notes:"Experienced, composed"},leagueQuality:{level:"High",notes:"Greek Super League (PAOK). Previously Premier League, Bundesliga, La Liga, Ligue 1.",eciRanking:"",eloRanking:""},recommendation:{verdict:"MONITOR",priority:"HIGH",suitableMarket:"Championship / Premier League",rationale:"Experienced LB with elite pedigree. Contract up June 2026.",clubRecommendations:[]},videoUrl:"https://vimeo.com/925203782/b505270898?share=copy",transfermarktUrl:"https://www.transfermarkt.co.uk/abdul-rahman-baba/profil/spieler/224884",fbrefUrl:"",status:"Signed",source:"1863 Player",addedBy:"Tony Verinder",dateAdded:"01/02/2026"},
  {id:"csv_12",name:"Leonard Ngenge",dob:"12/09/2007",nationality:"Nigeria",currentClub:"Leeds United FC (on loan at Ikorodu City)",position:"CB",foot:"Left",height:"",weight:"",international:"",transferFee:"Sell On",contractExpiry:"",description:"Leonard is a tall and mobile central defender who currently plays for Klassisch FC / Ikorodu City in Nigeria on loan from Leeds United. He recently impressed on a two-week trial at Aberdeen. He shows exciting potential with all the raw attributes to make it at a high level. He displays impressive athleticism, excellent technical ability and plays with a maturity that is beyond his years. He has a dominant personality on the pitch, anticipates well and is quick on the cover.",notes:"Received positive feedback from his trial at Aberdeen. 1863 player.",technical:{score:6,notes:"Good technical ability, comfortable on the ball"},tactical:{score:6,notes:"Good read of the game, anticipates well"},physical:{score:7,notes:"Tall, mobile, impressive athleticism"},mental:{score:7,notes:"Dominant personality, mature beyond his years"},leagueQuality:{level:"Low",notes:"On loan at Ikorodu City (Nigeria) from Leeds United",eciRanking:"",eloRanking:""},recommendation:{verdict:"MONITOR",priority:"MEDIUM",suitableMarket:"Scotland / Northern Europe",rationale:"Exciting raw talent on loan from Leeds. Trial at Aberdeen went well.",clubRecommendations:[]},videoUrl:"https://www.youtube.com/watch?app=desktop&si=z9D06qE0Vr_YmIsj&v=dno2TqO0X9U&feature=youtu.be",transfermarktUrl:"",fbrefUrl:"",status:"Signed",source:"1863 Player",addedBy:"Tony Verinder",dateAdded:"01/02/2026"},
  {id:"csv_13",name:"Sulaimon Olawale Fatai",dob:"04/04/2006",nationality:"Nigeria",currentClub:"Dream Football Academy",position:"CM",foot:"Right",height:"",weight:"",international:"",transferFee:"Sell On",contractExpiry:"",description:"Known as Wale, he is a composed and technical holding midfielder who currently plays for the Dream Football Academy in Nigeria. He recently returned from a two-week trial at Aberdeen where he received positive feedback for his technical ability. He previously operated as an 8/10 but has grown into his preferred position as a 4/6. He likes to screen the back line and dictate the tempo of play with a good range of passing.",notes:"Impressed on trial at Aberdeen but his style didn't fit with their requirements. 1863 player.",technical:{score:6,notes:"Good range of passing, tidy in possession"},tactical:{score:6,notes:"Screens the back line well, dictates tempo"},physical:{score:6,notes:""},mental:{score:7,notes:"Calm in possession, good presence on the pitch"},leagueQuality:{level:"Low",notes:"Dream Football Academy, Nigeria",eciRanking:"",eloRanking:""},recommendation:{verdict:"MONITOR",priority:"MEDIUM",suitableMarket:"Northern Europe / Scandinavia",rationale:"Young DM with Aberdeen trial experience. Needs European placement.",clubRecommendations:[]},videoUrl:"https://vimeo.com/926437596/1c0e8a581c?share=copy",transfermarktUrl:"",fbrefUrl:"",status:"Signed",source:"1863 Player",addedBy:"Tony Verinder",dateAdded:"01/02/2026"},
  {id:"csv_14",name:"Daniel Daga",dob:"10/01/2007",nationality:"Nigeria",currentClub:"FC One Rocket (on loan at Enyimba FC)",position:"CM",foot:"Right",height:"1.78m",weight:"56kg",international:"U20s",transferFee:"EUR 500,000 - 1million",contractExpiry:"",description:"Daniel is a young and technical midfielder who currently plays for Enyimba FC on loan from FC One Rocket. He represented Nigeria's U20s at the U20 AFCON and U20 World Cup where he excelled. He offers a great touch, can turn away from opponents with great awareness, his ball retention is impressive, and he has the vision to launch attacks. He is strong in the air and his defensive awareness allows him to break up play.",notes:"Huge interest from elite clubs including Chelsea, Aston Villa, Liverpool, AC Milan, Brighton. Unique opportunity below true market value. 1863 player.",technical:{score:8,notes:"Excellent touch, great ball retention, range of passing"},tactical:{score:7,notes:"Strong defensive awareness, vision to launch attacks"},physical:{score:7,notes:"Strong in the air, good athleticism"},mental:{score:8,notes:"Excellent awareness and skill, performed on big stage at U20 World Cup"},leagueQuality:{level:"Mid",notes:"Enyimba FC (Nigerian Premier League, biggest club in Nigeria)",eciRanking:"",eloRanking:""},recommendation:{verdict:"MONITOR",priority:"HIGH",suitableMarket:"Europe - Big 5 or development",rationale:"Standout at U20 World Cup. Elite interest. Acquire below market value.",clubRecommendations:[]},videoUrl:"https://vimeo.com/926418111/2d524765b5?share=copy",transfermarktUrl:"https://www.transfermarkt.co.uk/daniel-daga/profil/spieler/1015612",fbrefUrl:"",status:"Signed",source:"1863 Player",addedBy:"Tony Verinder",dateAdded:"01/02/2026"},
  {id:"csv_15",name:"Menzi Mazwi",dob:"18/04/2006",nationality:"England",currentClub:"Birmingham City",position:"CM",foot:"Left",height:"",weight:"",international:"",transferFee:"Training Compensation",contractExpiry:"30/06/2024",description:"After signing his first scholarship contract, Menzi broke into Birmingham City's U21s at the age of 16. A technically gifted and athletic player, he has the ability and versatility to operate in midfield or at the back. He can ball carry through the middle or out wide and has the awareness and skill to turn away from opponents. He likes to play forward, is neat and tidy in possession and times his runs well into the box.",notes:"Joined Birmingham at 13. Following a similar trajectory to Jude Bellingham. Birmingham have an option to extend his contract. Elo ranking 217. 1863 player.",technical:{score:7,notes:"Technically gifted, excellent ball carrier"},tactical:{score:6,notes:"Versatile - can operate in midfield or at the back"},physical:{score:7,notes:"Athletic, mobile"},mental:{score:7,notes:"Awareness and intelligence to turn away from opponents"},leagueQuality:{level:"High",notes:"Birmingham City Academy (Championship)",eciRanking:"",eloRanking:"217"},recommendation:{verdict:"MONITOR",priority:"HIGH",suitableMarket:"Championship / League One",rationale:"Highly rated young CM following Bellingham trajectory.",clubRecommendations:[]},videoUrl:"https://vimeo.com/926428114/3539435ed4?share=copy",transfermarktUrl:"https://www.transfermarkt.co.uk/menzi-mazwi/profil/spieler/955074",fbrefUrl:"",status:"Signed",source:"1863 Player",addedBy:"Tony Verinder",dateAdded:"01/02/2026"},
  {id:"csv_16",name:"Aaron Rowe",dob:"07/09/2000",nationality:"England/Jamaica",currentClub:"Gillingham AFC",position:"LW",foot:"Right",height:"1.77m",weight:"69kg",international:"",transferFee:"Free Transfer",contractExpiry:"30/06/2024",description:"Aaron is a quick, versatile and skilful player. Originally a right back, he has excelled operating as an attacking midfielder. He is comfortable on either foot and can operate on either flank when playing out wide. He displays excellent pace and acceleration, can skip past players with quick feet and a drop of the shoulder, and makes progressive runs from deep to support the attack.",notes:"Made his Premier League debut for Huddersfield in 2019. Had loan spells at Stockport County and Crewe Alexandra (5G 4A in 33 apps). Salary c.£3,000/week. 1863 player.",technical:{score:7,notes:"Comfortable on either foot, quick feet"},tactical:{score:6,notes:"Versatile across attack and wide positions"},physical:{score:8,notes:"Excellent pace and acceleration"},mental:{score:6,notes:""},leagueQuality:{level:"Mid",notes:"Gillingham (League Two). Previously Huddersfield PL, Crewe.",eciRanking:"",eloRanking:""},recommendation:{verdict:"MONITOR",priority:"HIGH",suitableMarket:"Championship / League One",rationale:"Quick versatile winger, free transfer, league-proven.",clubRecommendations:[]},videoUrl:"https://vimeo.com/926426003/639fbd972b?share=copy",transfermarktUrl:"https://www.transfermarkt.co.uk/aaron-rowe/leistungsdaten/spieler/657994",fbrefUrl:"",status:"Signed",source:"1863 Player",addedBy:"Tony Verinder",dateAdded:"01/02/2026"},
  {id:"csv_17",name:"Emmanuel Ikechukwu",dob:"03/06/2005",nationality:"Nigeria",currentClub:"DN10 FA",position:"LW",foot:"Right",height:"",weight:"",international:"",transferFee:"TBC",contractExpiry:"",description:"Emmanuel is a young and promising winger who recently signed for the DN10 Football Academy. He offers great vision and has the ability to pick out team mates with accurate passing. He has the confidence to take players on and has the skill and ball control to beat opponents with ease. He is strong on the ball, good in the air and he can hold up play to bring others into the game.",notes:"1863 player.",technical:{score:6,notes:"Good vision and passing range"},tactical:{score:5,notes:""},physical:{score:6,notes:"Strong on the ball, good in the air"},mental:{score:6,notes:""},leagueQuality:{level:"Low",notes:"DN10 Football Academy, Nigeria",eciRanking:"",eloRanking:""},recommendation:{verdict:"MONITOR",priority:"MEDIUM",suitableMarket:"Northern Europe / Scandinavia",rationale:"Young Nigerian winger. Needs European placement.",clubRecommendations:[]},videoUrl:"https://vimeo.com/926442430/86364ecce3?share=copy",transfermarktUrl:"",fbrefUrl:"",status:"Signed",source:"1863 Player",addedBy:"Tony Verinder",dateAdded:"01/02/2026"},
  {id:"csv_18",name:"Saikou Janneh",dob:"11/01/2000",nationality:"England/Gambia",currentClub:"Cambridge United",position:"ST",foot:"Right",height:"1.84m",weight:"69kg",international:"",transferFee:"Free Transfer",contractExpiry:"30/06/2024",description:"Previously of Bristol City, Saikou is a quick and skilful forward who plays for Cambridge United. He offers good movement, drifts between defenders and can get in behind. He has the versatility to also operate out wide and has the ability to score all types of goals. He is creative in the final third and has the pace and technical ability to beat players one on one.",notes:"Loan spells at Newport, Torquay and Shrewsbury Town. 92 senior appearances. 1863 player.",technical:{score:7,notes:"Quick feet, can beat players 1v1, creative"},tactical:{score:6,notes:"Good movement, versatile"},physical:{score:8,notes:"Pace and acceleration"},mental:{score:6,notes:""},leagueQuality:{level:"Mid",notes:"Cambridge United (League One)",eciRanking:"",eloRanking:""},recommendation:{verdict:"MONITOR",priority:"HIGH",suitableMarket:"Championship",rationale:"League One forward with free transfer value. Pace and versatility.",clubRecommendations:[]},videoUrl:"https://vimeo.com/926419783/9e2a33ebab?share=copy",transfermarktUrl:"https://www.transfermarkt.co.uk/saikou-janneh/profil/spieler/607199",fbrefUrl:"",status:"Signed",source:"1863 Player",addedBy:"Tony Verinder",dateAdded:"01/02/2026"},
  {id:"csv_19",name:"Sambou Soumano",dob:"13/01/2001",nationality:"Senegal",currentClub:"Lorient (on loan at Quevilly-Rouen)",position:"ST",foot:"Both",height:"1.82m",weight:"70kg",international:"",transferFee:"EUR 1.5-2million plus sell on",contractExpiry:"30/06/2026",description:"Soumano is a young and talented centre forward on loan at QRM in France's Ligue 2. He is fulfilling his potential with 14 goals and 2 assists in 37 appearances. After impressing in Lorient's B team he made his senior debut in 2021. He has a strong all-round game with good movement, excellent athleticism and clinical finishing. He is comfortable playing under pressure and dealing with physical defenders.",notes:"Loan spells at Eupen, Rodez and Quevilly-Rouen. Parent club Lorient. Worth proposing to Concarneau. 1863 player.",technical:{score:7,notes:"Good touch, clinical finishing"},tactical:{score:7,notes:"Good movement, link play, in behind"},physical:{score:8,notes:"Excellent athleticism, handles physical defenders"},mental:{score:7,notes:"Comfortable under pressure"},leagueQuality:{level:"High",notes:"Ligue 2 (Quevilly-Rouen) on loan from Ligue 1 club Lorient",eciRanking:"",eloRanking:""},recommendation:{verdict:"MONITOR",priority:"MEDIUM",suitableMarket:"Ligue 1 / Championship",rationale:"14 goals in Ligue 2. Lorient parent club. Good sell-on structure.",clubRecommendations:[]},videoUrl:"https://vimeo.com/926556174/1073660338?share=copy",transfermarktUrl:"https://www.transfermarkt.co.uk/sambou-soumano/profil/spieler/704270",fbrefUrl:"",status:"Signed",source:"1863 Player",addedBy:"Tony Verinder",dateAdded:"01/02/2026"},
  {id:"csv_20",name:"Pape Habib Gueye",dob:"20/09/1999",nationality:"Senegal",currentClub:"Kasimpasa",position:"ST",foot:"Right",height:"1.88m",weight:"84kg",international:"Senegal U20",transferFee:"TBC",contractExpiry:"30/06/2029",description:"Pape is a powerful centre forward who plays for Kasimpasa in the Turkish Super League, having joined from Aberdeen on 1 August 2025. He has scored 65 and assisted 14 in approximately 231 career appearances. He offers excellent aerial ability, good movement and composed finishing. He can drift wide, run in behind and has the physical attributes to play with his back to goal. In 2025/26 he has scored 5 goals in 17 Super Lig appearances (1,423 mins), demonstrating his ability to contribute at a higher level.",notes:"2025/26 (Kasimpasa, Super Lig): 17 apps, 5G, 0A, avg FotMob rating 6.41. Joined Kasimpasa from Aberdeen on 1 Aug 2025, contract to Jun 2029. Previously Aberdeen (Scottish Cup winner 2025), Kortrijk, Aalesund. Foot is left. 1863 player.",technical:{score:7,notes:"Good touch, composed finishing, scored headers vs Man City at Wembley"},tactical:{score:7,notes:"Intelligent movement, drifts wide, can play back to goal"},physical:{score:8,notes:"Excellent aerial ability, powerful"},mental:{score:7,notes:"Scores big goals, strong mentality"},leagueQuality:{level:"High",notes:"Turkish Super League (Kasimpasa). Previously Scottish Premiership Aberdeen.",eciRanking:"",eloRanking:""},recommendation:{verdict:"MONITOR",priority:"MEDIUM",suitableMarket:"Championship / Premier League",rationale:"Turkish Super League striker. 1863 client. Contract to 2029.",clubRecommendations:[]},videoUrl:"https://vimeo.com/926615123/fbe36eb0d8?share=copy",transfermarktUrl:"https://www.transfermarkt.co.uk/pape-habib-gueye/profil/spieler/585339",fbrefUrl:"",status:"Signed",source:"1863 Player",addedBy:"Tony Verinder",dateAdded:"01/02/2026"},
  {id:"csv_21",name:"Silas Nwankwo",dob:"12/12/2003",nationality:"Nigeria",currentClub:"Mjallby AIF",position:"ST",foot:"Right",height:"1.83m",weight:"75kg",international:"",transferFee:"TBC",contractExpiry:"31/12/2025",description:"Silas is a traditional number 9 who plays for Mjallby in Sweden's Allsvenskan. After topping the Nigerian Professional Football League scoring charts, he joined Mjallby and impressed in his debut season scoring 8 in 29 appearances. He displays great athleticism, good perseverance and excellent balance. He comes alive around the box and excels at finding space in the area to finish.",notes:"Suffered ACL injury but now back and fully fit. Before injury had interest from many clubs. Strong potential resale value. ECI 335/353. 1863 player.",technical:{score:7,notes:"Comes alive around the box, good finishing"},tactical:{score:6,notes:"Good movement, traditional no.9"},physical:{score:7,notes:"Great athleticism, excellent balance"},mental:{score:7,notes:"Good perseverance, came back from ACL"},leagueQuality:{level:"Mid",notes:"Allsvenskan (Mjallby AIF). ECI 335 equivalent to Aberdeen.",eciRanking:"335",eloRanking:"353"},recommendation:{verdict:"MONITOR",priority:"HIGH",suitableMarket:"Championship / Scandinavia",rationale:"Traditional 9 with ACL recovery done. Contract expired Dec 2025.",clubRecommendations:[]},videoUrl:"https://vimeo.com/926560537/30ac53da57?share=copy",transfermarktUrl:"https://www.transfermarkt.co.uk/silas-nwankwo/profil/spieler/740860",fbrefUrl:"",status:"Signed",source:"1863 Player",addedBy:"Tony Verinder",dateAdded:"01/02/2026"},
  {id:"csv_22",name:"Ally Samatta",dob:"23/12/1992",nationality:"Tanzania",currentClub:"Le Havre",position:"ST",foot:"Right",height:"1.83m",weight:"75kg",international:"76 caps, 19 goals",transferFee:"TBC",contractExpiry:"30/06/2026",description:"Formerly of Aston Villa and PAOK, Ally now plays for Le Havre in Ligue 1 having joined on 5 August 2025. He has a remarkable career record of 131 goals and 40 assists in 437 appearances across all clubs. He can play in behind or with his back to goal, offers dynamic movement and is clinical in the box. His hold up play is exceptional and he is one of the best offensive headers of the ball in Europe. He captains Tanzania and has Champions League, Europa League and Conference League experience.",notes:"2025/26 (Le Havre, Ligue 1): 9 appearances, 0 goals — still finding form in France. Joined Le Havre on 5 Aug 2025, contract to Jun 2026. Previously PAOK (Greek title winner 2023/24). Belgian Pro League top scorer with Genk (20 goals 2018/19). Scored at Wembley vs Man City, at Anfield vs Liverpool in UCL. 76 Tanzania caps. 1863 player.",technical:{score:8,notes:"Clinical finisher, exceptional hold up play"},tactical:{score:8,notes:"Dynamic movement, understands space exceptionally"},physical:{score:7,notes:"Quick, strong in the air, physical presence"},mental:{score:8,notes:"Scores big goals, captained Tanzania, excellent mentality"},leagueQuality:{level:"High",notes:"Ligue 1 (Le Havre). Previously Greek Super League PAOK (champions), Premier League Aston Villa, Belgian Pro League Genk (champions).",eciRanking:"",eloRanking:""},recommendation:{verdict:"MONITOR",priority:"HIGH",suitableMarket:"Premier League / Championship",rationale:"Elite career history. Now at Le Havre in Ligue 1. Contract to June 2026.",clubRecommendations:[]},videoUrl:"https://vimeo.com/926424946/6190f675f7?share=copy",transfermarktUrl:"https://www.transfermarkt.co.uk/ally-samatta/profil/spieler/182201",fbrefUrl:"",status:"Signed",source:"1863 Player",addedBy:"Tony Verinder",dateAdded:"01/02/2026"},
  {id:"csv_23",name:"Rauf Adigun",dob:"",nationality:"Nigeria",currentClub:"ABM Sport Republic",position:"GK",foot:"",height:"",weight:"",international:"",transferFee:"TBC",contractExpiry:"",description:"",notes:"1863 player.",technical:{score:6,notes:""},tactical:{score:6,notes:""},physical:{score:6,notes:""},mental:{score:6,notes:""},leagueQuality:{level:"Low",notes:"ABM Sport Republic, Nigeria",eciRanking:"",eloRanking:""},recommendation:{verdict:"MONITOR",priority:"LOW",suitableMarket:"",rationale:"",clubRecommendations:[]},videoUrl:"",transfermarktUrl:"",fbrefUrl:"",status:"Signed",source:"1863 Player",addedBy:"Tony Verinder",dateAdded:"01/02/2026"},
  {id:"csv_24",name:"Uche Ezugwu",dob:"",nationality:"Nigeria",currentClub:"ABM Sport Republic",position:"ST",foot:"",height:"",weight:"",international:"",transferFee:"TBC",contractExpiry:"",description:"",notes:"1863 player.",technical:{score:6,notes:""},tactical:{score:6,notes:""},physical:{score:6,notes:""},mental:{score:6,notes:""},leagueQuality:{level:"Low",notes:"ABM Sport Republic, Nigeria",eciRanking:"",eloRanking:""},recommendation:{verdict:"MONITOR",priority:"LOW",suitableMarket:"",rationale:"",clubRecommendations:[]},videoUrl:"",transfermarktUrl:"",fbrefUrl:"",status:"Signed",source:"1863 Player",addedBy:"Tony Verinder",dateAdded:"01/02/2026"},
  {id:"csv_25",name:"Charles Agada",dob:"03/09/2006",nationality:"Nigeria",currentClub:"FC Mavlon",position:"ST",foot:"Right",height:"1.74m",weight:"62kg",international:"U17s & U20s",transferFee:"TBC",contractExpiry:"",description:"Agada is an exciting young prospect who plays for FC Mavlon in Nigeria. Similar in playing style to Sergio Aguero, he is capable of scoring and assisting all types of goals. He offers great pace and acceleration combined with quick feet and intelligent movement. He has the ability to find space, pick passes and beat players in one-on-one situations.",notes:"Played against Bulgaria's top academies and scored twice against Atromitos in a 3-0 win. Capped at U17 and U20 level. 1863 player.",technical:{score:7,notes:"Quick feet, intelligent movement, clinical"},tactical:{score:6,notes:"Finds space, picks passes well"},physical:{score:7,notes:"Pace and acceleration"},mental:{score:6,notes:""},leagueQuality:{level:"Low",notes:"FC Mavlon, Nigeria",eciRanking:"",eloRanking:""},recommendation:{verdict:"MONITOR",priority:"HIGH",suitableMarket:"Nigeria / Scandinavia / Belgium",rationale:"Nigeria U17 & U20 international. Exciting Aguero-type profile.",clubRecommendations:[]},videoUrl:"https://vimeo.com/927714106/480fc84da2?share=copy",transfermarktUrl:"https://www.transfermarkt.co.uk/charles-adah-agada/profil/spieler/1129893",fbrefUrl:"",status:"Monitoring",source:"Mandated by Club",addedBy:"Tony Verinder",dateAdded:"01/02/2026"},
  {id:"csv_26",name:"Jegbay Konneh",dob:"",nationality:"Liberia",currentClub:"FC G'arou",position:"CM",foot:"",height:"",weight:"",international:"",transferFee:"TBC",contractExpiry:"",description:"",notes:"1863 player.",technical:{score:6,notes:""},tactical:{score:6,notes:""},physical:{score:6,notes:""},mental:{score:6,notes:""},leagueQuality:{level:"Low",notes:"FC G'arou",eciRanking:"",eloRanking:""},recommendation:{verdict:"MONITOR",priority:"MEDIUM",suitableMarket:"",rationale:"",clubRecommendations:[]},videoUrl:"",transfermarktUrl:"https://www.transfermarkt.com/jegbay-morris-konneh/profil/spieler/990380",fbrefUrl:"",status:"Signed",source:"1863 Player",addedBy:"Tony Verinder",dateAdded:"01/02/2026"},
  {id:"csv_27",name:"Samy Chouchane",dob:"",nationality:"Tunisia",currentClub:"Brighton & Hove Albion",position:"CM",foot:"",height:"",weight:"",international:"",transferFee:"TBC",contractExpiry:"",description:"",notes:"Monitored by 1863.",technical:{score:6,notes:""},tactical:{score:6,notes:""},physical:{score:6,notes:""},mental:{score:6,notes:""},leagueQuality:{level:"Elite",notes:"Brighton & Hove Albion (Premier League)",eciRanking:"",eloRanking:""},recommendation:{verdict:"MONITOR",priority:"MEDIUM",suitableMarket:"",rationale:"",clubRecommendations:[]},videoUrl:"",transfermarktUrl:"",fbrefUrl:"",status:"Monitoring",source:"1863",addedBy:"AV",dateAdded:"01/02/2026"},
  {id:"csv_28",name:"Ondrej Lingr",dob:"07/10/1998",nationality:"Czech",currentClub:"Slavia Prague (on loan at Feyenoord)",position:"AM",foot:"Right",height:"",weight:"",international:"13 caps",transferFee:"c. €4million",contractExpiry:"30/06/2025",description:"Ondrej is a mobile attacking midfielder on loan at Feyenoord from Slavia Prague. He previously scored 40 and assisted 11 in 138 appearances for Slavia (73 starts) at a rate of 0.66 goals/assists per 90. He helped the club win a league and cup double in 2021 and has Europa League and Champions League experience. He offers dynamic and intelligent movement that can break lines and get in behind defences.",notes:"Has an agent who isn't well connected. The Zikas have worked with him previously on his move to Feyenoord and will include him in any deal. Slavia Prague. Mandate possible.",technical:{score:7,notes:"Excellent movement, breaking lines"},tactical:{score:7,notes:"Dynamic, intelligent off the ball"},physical:{score:7,notes:"Mobile"},mental:{score:7,notes:"Good work ethic"},leagueQuality:{level:"High",notes:"Eredivisie (Feyenoord loan) from Czech league Slavia Prague. EL/UCL experience.",eciRanking:"",eloRanking:""},recommendation:{verdict:"MONITOR",priority:"MEDIUM",suitableMarket:"Premier League / Bundesliga",rationale:"Czech international, UCL experience. c.€4m. Contract June 2025.",clubRecommendations:[]},videoUrl:"https://vimeo.com/936232943/542eed9887?share=copy",transfermarktUrl:"https://www.transfermarkt.com/ondrej-lingr/profil/spieler/321195",fbrefUrl:"",status:"Monitoring",source:"Mandated",addedBy:"Tony Verinder",dateAdded:"01/02/2026"},
  {id:"csv_29",name:"Lorran",dob:"04/07/2006",nationality:"Brazil",currentClub:"Flamengo",position:"AM",foot:"Left",height:"1.80m",weight:"68kg",international:"U16s and U17s",transferFee:"TBC",contractExpiry:"31/12/2029",description:"Lorran is a young and exciting forward who plays for Flamengo in Brazil's Serie A. He broke Vinicius Jr's record by becoming Flamengo's youngest ever scorer at 16. A skilful and technical player who can operate through the middle or out wide, he has scored 2 and assisted 3 in 35 senior appearances. He is a superb ball carrier and excels in 1v1 situations. He won the U17 South American Championship with Brazil in 2023.",notes:"Signed new contract until Dec 2029 with reported EUR 50m release clause. CSKA Moscow bid EUR 8m. Linked with Man United and Nottm Forest. Potential mandate for UK. 1863 player.",technical:{score:8,notes:"Superb ball carrier, 1v1 ability, excellent technique"},tactical:{score:7,notes:"Industrious, effective in forward press"},physical:{score:7,notes:"Good athleticism, quick"},mental:{score:7,notes:"Clinical, composed"},leagueQuality:{level:"High",notes:"Flamengo, Brazil Serie A. EUR 50m release clause.",eciRanking:"",eloRanking:""},recommendation:{verdict:"MONITOR",priority:"MEDIUM",suitableMarket:"Premier League / Champions League clubs",rationale:"Flamengo superstar. EUR 50m release. Potential UK mandate.",clubRecommendations:[]},videoUrl:"https://vimeo.com/1050068808/6dfe51e06b",transfermarktUrl:"https://www.transfermarkt.co.uk/lorran/profil/spieler/1009030",fbrefUrl:"",status:"Monitoring",source:"Mandated",addedBy:"AV",dateAdded:"01/02/2026"},
  {id:"csv_30",name:"Gianni Stensness",dob:"07/02/1999",nationality:"Australia",currentClub:"Viking FK",position:"CB",foot:"Right",height:"1.85m",weight:"82kg",international:"2 caps",transferFee:"TBC",contractExpiry:"30/06/2024",description:"Stensness is a ball playing central defender for Viking FK in Norway's Eliteserien. Capable of operating as a central defender or defensive midfielder, he has made over 50 A-League appearances before joining Viking and has made 49 appearances for the club. He is very comfortable on the ball and makes more progressive passes forward than any other centre back in the league.",notes:"Missed majority of last season with ACL injury but back fit for start of Norwegian season. One of top 3 CBs in Norwegian league. Good value with contract expiring. ECI/Elo 116/215.",technical:{score:7,notes:"Very comfortable on ball, progressive passing"},tactical:{score:7,notes:"Versatile - CB or DM"},physical:{score:7,notes:"1.85m, good athletic profile"},mental:{score:7,notes:""},leagueQuality:{level:"Mid",notes:"Eliteserien (Viking FK). ECI 116 on par with Cardiff, Malmo.",eciRanking:"116",eloRanking:"215"},recommendation:{verdict:"MONITOR",priority:"HIGH",suitableMarket:"Championship / Bundesliga",rationale:"Australian international, ball-playing CB. Contract expired.",clubRecommendations:[]},videoUrl:"https://vimeo.com/926419896/f7ab366a3b?share=copy",transfermarktUrl:"https://www.transfermarkt.co.uk/gianni-stensness/profil/spieler/627472",fbrefUrl:"",status:"Monitoring",source:"Mandated",addedBy:"Tony Verinder",dateAdded:"01/02/2026"},
  {id:"csv_31",name:"Jorthy Mokio",dob:"29/02/2008",nationality:"Belgium",currentClub:"Gent",position:"CB",foot:"Left",height:"1.91m",weight:"",international:"U15s, U16s, U17s",transferFee:"TBC",contractExpiry:"",description:"Jorthy is a young and promising left sided central defender who plays for Gent in Belgium. He made his debut for Gent's U19s in the UEFA Youth League at the age of 15. He is very composed on the ball, launches attacks with accurate diagonals and is comfortable building play into the half spaces. He has impressive physical attributes and is a natural leader.",notes:"ECI/Elo 74/78 on par with Bournemouth, Celtic, Leeds, Valencia. Captained Belgium U15s and U16s. Excellent scouting report available.",technical:{score:7,notes:"Composed on ball, accurate diagonals"},tactical:{score:7,notes:"Comfortable in half spaces, builds play"},physical:{score:7,notes:"1.91m, impressive physical attributes"},mental:{score:8,notes:"Natural leader, captained Belgium youth sides"},leagueQuality:{level:"Elite",notes:"Gent (Belgium), ECI 74 on par with Bournemouth / Celtic.",eciRanking:"74",eloRanking:"78"},recommendation:{verdict:"MONITOR",priority:"HIGH",suitableMarket:"Premier League / Bundesliga",rationale:"Top Belgian youth CB. Future PL star potential. UCL youth experience at 15.",clubRecommendations:[]},videoUrl:"https://vimeo.com/926397902/1fc7dc6e7e?share=copy",transfermarktUrl:"https://www.transfermarkt.co.uk/jorthy-mokio/leistungsdaten/spieler/1105532",fbrefUrl:"",status:"Monitoring",source:"TBC",addedBy:"Tony Verinder",dateAdded:"01/02/2026"},
  {id:"csv_32",name:"Anel Ahmedhodzic",dob:"06/07/1999",nationality:"Bosnia/Sweden",currentClub:"Sheffield United",position:"CB",foot:"Right",height:"1.95m",weight:"84kg",international:"24 caps, 1 goal",transferFee:"TBC",contractExpiry:"30/06/2026",description:"Ahmedhodzic is a tall and imposing central defender at Sheffield United. He has made 72 appearances for the club since joining from Malmo in 2022 and was a mainstay in their promotion from the Championship. A robust tackler and assertive ball winner, he is strong in the air and is an asset in both boxes. He is comfortable on the ball, can carry it out from the back and has the tactical understanding to operate in a back three or four.",notes:"Represented by CAA Base but can sell on behalf of Sheffield United through Prince Abdullah. Good analysis at Total Football Analysis. Potential Branthwaite replacement at Everton. Bosnian international.",technical:{score:7,notes:"Comfortable on ball, carries out from back"},tactical:{score:7,notes:"Back three or four, intelligent positioning"},physical:{score:8,notes:"Tall, imposing, robust tackler, strong in air"},mental:{score:7,notes:"Seasoned international"},leagueQuality:{level:"High",notes:"Sheffield United (Championship). EL/UCL experience.",eciRanking:"",eloRanking:""},recommendation:{verdict:"MONITOR",priority:"MEDIUM",suitableMarket:"Premier League",rationale:"Experienced Championship CB. Bosnian international. Contract June 2026.",clubRecommendations:[]},videoUrl:"https://vimeo.com/961020946",transfermarktUrl:"https://www.transfermarkt.com/anel-ahmedhodzic/profil/spieler/377468",fbrefUrl:"",status:"Monitoring",source:"Mandated",addedBy:"Tony Verinder",dateAdded:"01/02/2026"},
  {id:"csv_33",name:"Toya Nakamura",dob:"23/07/2000",nationality:"Japan",currentClub:"H. C. Sapporo",position:"CB",foot:"Left",height:"1.86m",weight:"78kg",international:"U18s",transferFee:"EUR 700,000 - 800,000",contractExpiry:"31/01/2026",description:"Toya is a promising left sided central defender who plays for Sapporo in Japan's J1 League. He has made 94 appearances for the club and has the versatility to operate at full back and in midfield. He offers good positioning and anticipation and is strong in the tackle. He has the technical ability to bring the ball out from the back and can drive forward to initiate attacks.",notes:"Potential to be like Ito who moved to Bayern from Stuttgart. Ability to carry the ball as he played forward as a youth player. Left-handed centre backs are valuable.",technical:{score:7,notes:"Technical ball carrier, good range of passing"},tactical:{score:6,notes:"Versatile - CB, FB, midfield"},physical:{score:7,notes:"Strong in tackle, good in the air"},mental:{score:6,notes:""},leagueQuality:{level:"Mid",notes:"J1 League (H.C. Sapporo)",eciRanking:"",eloRanking:""},recommendation:{verdict:"MONITOR",priority:"MEDIUM",suitableMarket:"Bundesliga / Belgium / Netherlands",rationale:"Left-footed CB, versatile, EUR 700-800k. Contract Jan 2026.",clubRecommendations:[]},videoUrl:"https://vimeo.com/manage/videos/961032812/2bb51db978",transfermarktUrl:"https://www.transfermarkt.com/toya-nakamura/leistungsdaten/spieler/576453",fbrefUrl:"",status:"Monitoring",source:"Mandated",addedBy:"Tony Verinder",dateAdded:"01/02/2026"},
  {id:"csv_34",name:"Bartol Franjic",dob:"",nationality:"Croatian",currentClub:"Wolfsburg",position:"CB",foot:"",height:"",weight:"",international:"",transferFee:"Free Loan with an option",contractExpiry:"30/06/2027",description:"",notes:"Croatian CB at Wolfsburg. Free loan with option available. Mandated.",technical:{score:6,notes:""},tactical:{score:6,notes:""},physical:{score:6,notes:""},mental:{score:6,notes:""},leagueQuality:{level:"Elite",notes:"Wolfsburg (Bundesliga)",eciRanking:"",eloRanking:""},recommendation:{verdict:"MONITOR",priority:"MEDIUM",suitableMarket:"Championship / Eredivisie",rationale:"Wolfsburg CB available on loan. Croatian.",clubRecommendations:[]},videoUrl:"https://vimeo.com/1026615564/55ed354970",transfermarktUrl:"https://www.transfermarkt.co.uk/bartol-franjic/profil/spieler/370998",fbrefUrl:"",status:"Monitoring",source:"Mandated",addedBy:"AV",dateAdded:"01/02/2026"},
  {id:"csv_35",name:"Emmanuel Essiam",dob:"19/12/2003",nationality:"Ghana",currentClub:"FC Basel (on loan at Stade-Lausanne)",position:"CM",foot:"Right",height:"",weight:"",international:"U20s and U23s",transferFee:"c. €4million",contractExpiry:"30/06/2026",description:"Essiam is a young and agile midfielder at FC Basel in the Swiss Super League. He has the ability to force mistakes with an intense pressing game and his recovery work is equally impressive. In transition he can break forward with and without the ball and is a powerful option through the middle. He earned his move to Basel after starring in every game for Ghana's U20s as they won the U20 AFCON in 2021.",notes:"No agent but has a manager without a FIFA license. Norwich are interested, scores highly on physical data metrics. Conference League experience.",technical:{score:7,notes:"Agile, good touch"},tactical:{score:7,notes:"Intense pressing, excellent recovery work"},physical:{score:8,notes:"Powerful, exceptional physical data metrics"},mental:{score:7,notes:""},leagueQuality:{level:"High",notes:"Swiss Super League (FC Basel). Conference League experience.",eciRanking:"",eloRanking:""},recommendation:{verdict:"MONITOR",priority:"MEDIUM",suitableMarket:"Championship / Bundesliga",rationale:"Ghana U20 AFCON winner. c.€4m. Norwich interested.",clubRecommendations:[]},videoUrl:"https://vimeo.com/926330896/0383886fe2?share=copy",transfermarktUrl:"https://www.transfermarkt.co.uk/emmanuel-essiam/profil/spieler/863745",fbrefUrl:"",status:"Monitoring",source:"TBC",addedBy:"Tony Verinder",dateAdded:"01/02/2026"},
  {id:"csv_36",name:"Patrick Yazbek",dob:"05/04/2002",nationality:"Australia",currentClub:"Viking",position:"CM",foot:"Right",height:"1.78m",weight:"67kg",international:"1 senior cap",transferFee:"c. EUR 2million+",contractExpiry:"31/12/2026",description:"Patrick is a young and mobile midfielder at Viking in Norway. He has scored 2 and assisted 6 in 38 appearances. A box-to-box player who can contribute at either end, he offers good vision, decent range of passing and can progress play with runs from deep. He is a regular starter for Australia's U23s and recently made his debut for Australia's senior side.",notes:"ECI/Elo 116/215 on par with Cardiff, Greuter Furth, Malmo. Moved from Sydney for €475k in February 2023. Viking narrowly missed European qualification.",technical:{score:7,notes:"Good vision, decent passing range"},tactical:{score:7,notes:"Box-to-box, contributes at both ends"},physical:{score:7,notes:"Athletic, good pressing work rate"},mental:{score:7,notes:""},leagueQuality:{level:"Mid",notes:"Eliteserien (Viking). ECI 116.",eciRanking:"116",eloRanking:"215"},recommendation:{verdict:"MONITOR",priority:"HIGH",suitableMarket:"Championship / Bundesliga / A-League",rationale:"Australian international, box-to-box CM. c.€2m+.",clubRecommendations:[]},videoUrl:"https://vimeo.com/926418246/cf1e96cded?share=copy",transfermarktUrl:"https://www.transfermarkt.co.uk/patrick-yazbek/profil/spieler/867762",fbrefUrl:"",status:"Monitoring",source:"Mandated",addedBy:"Tony Verinder",dateAdded:"01/02/2026"},
  {id:"csv_37",name:"Cameron Devlin",dob:"07/06/1998",nationality:"Australia",currentClub:"Hearts",position:"CM",foot:"Right",height:"1.70m",weight:"68kg",international:"4 caps",transferFee:"TBC",contractExpiry:"31/05/2026",description:"Cameron is an energetic and combative midfielder at Hearts in the Scottish Premiership. He has made over 179 appearances for Hearts since joining from Newcastle Jets in 2021. He combines an aggressive pressing style with a good work rate and intelligent read of the game. He excels in transition, winning the ball back in key areas and recycling possession to begin attacks. In 2025/26 he has made 22 appearances scoring 1 goal with a season average FotMob rating of 7.77 — one of the best midfielders in the league.",notes:"2025/26 (Hearts, Scottish Prem): 22 apps, 1G, 0A, avg rating 7.77 — top rated CM in Scottish Premiership. Leads league in recoveries per 90 and defensive duels won. £350k release clause. Championship and MLS interest reported. Contract expires May 2026. 1863 player.",technical:{score:7,notes:"Good passing range, creative in final third"},tactical:{score:8,notes:"Exceptional transitions, reads game superbly"},physical:{score:7,notes:"Energetic, combative"},mental:{score:8,notes:"Committed leader, top stats in the league"},leagueQuality:{level:"High",notes:"Scottish Premiership (Hearts). Conference League experience.",eciRanking:"",eloRanking:""},recommendation:{verdict:"MONITOR",priority:"MEDIUM",suitableMarket:"Championship / MLS",rationale:"£350k release clause. Top performer in Scottish Prem. Australian international.",clubRecommendations:[]},videoUrl:"https://vimeo.com/1130916529/c5efcfc7a6?fl=tl&fe=ec",transfermarktUrl:"https://www.transfermarkt.co.uk/cammy-devlin/leistungsdaten/spieler/399162/plus/0?saison=2021",fbrefUrl:"",status:"Monitoring",source:"Mandated",addedBy:"Tony Verinder",dateAdded:"01/02/2026"},
  {id:"csv_38",name:"Nikola Moro",dob:"",nationality:"Croatia",currentClub:"Bologna",position:"CM",foot:"",height:"",weight:"",international:"",transferFee:"EUR 10million",contractExpiry:"30/06/2027",description:"",notes:"Croatian CM at Bologna (Serie A / Champions League). EUR 10m valuation. Mandated by AV.",technical:{score:7,notes:""},tactical:{score:7,notes:""},physical:{score:7,notes:""},mental:{score:7,notes:""},leagueQuality:{level:"Elite",notes:"Bologna (Serie A / Champions League)",eciRanking:"",eloRanking:""},recommendation:{verdict:"MONITOR",priority:"MEDIUM",suitableMarket:"Premier League",rationale:"Serie A CM with Champions League experience. EUR 10m.",clubRecommendations:[]},videoUrl:"https://vimeo.com/1032821206/15f0cbd4bf",transfermarktUrl:"https://www.transfermarkt.co.uk/nikola-moro/profil/spieler/316934",fbrefUrl:"",status:"Monitoring",source:"Mandated",addedBy:"AV",dateAdded:"01/02/2026"},
  {id:"csv_39",name:"Apostolos Stamatelopoulos",dob:"09/04/1999",nationality:"Australia",currentClub:"Motherwell",position:"ST",foot:"Right",height:"1.84m",weight:"84kg",international:"1 senior cap",transferFee:"£400,000",contractExpiry:"30/06/2027",description:"Apo is a tenacious centre forward at Motherwell in the Scottish Premiership with 10 goals and 4 assists in 36 appearances. Previously at Newcastle Jets where he scored 20 in 38 appearances. He is capable of playing with his back to goal and excels at attacking the ball. His movement away from and across defenders is excellent and he is strong in the air.",notes:"Slightly behind his xG (9.18) this season, majority from the spot. High chance creation data, top 20% for centre forwards. Worth proposing to Championship. 1863 player.",technical:{score:7,notes:"Good hold-up, strong in air"},tactical:{score:7,notes:"Excellent movement across and away from defenders"},physical:{score:7,notes:"Strong, good athleticism"},mental:{score:7,notes:"Tenacious"},leagueQuality:{level:"High",notes:"Scottish Premiership (Motherwell). Previously A-League Newcastle Jets.",eciRanking:"",eloRanking:""},recommendation:{verdict:"MONITOR",priority:"HIGH",suitableMarket:"Championship",rationale:"Strong no.9. Scottish Prem top performer. Top 20% for chance creation.",clubRecommendations:[]},videoUrl:"https://vimeo.com/926615657/182d2474a6?share=copy",transfermarktUrl:"https://www.transfermarkt.co.uk/apostolos-stamatelopoulos/profil/spieler/547924",fbrefUrl:"",status:"Monitoring",source:"Mandated",addedBy:"Tony Verinder",dateAdded:"01/02/2026"},
  {id:"csv_40",name:"Jalal Abdulai",dob:"05/01/2005",nationality:"Ghana",currentClub:"Elfsborg",position:"ST",foot:"Both",height:"1.86m",weight:"",international:"",transferFee:"TBC",contractExpiry:"31/12/2027",description:"Jalal is a young, technical and hard working forward who has made a bright start at Elfsborg in Sweden. He has scored 10 and provided an assist in 30 appearances at an impressive rate of 0.80 goals/assists per 90. He offers great strength and physicality combined with good pace, allowing him to press defenders and play with his back to goal. He has 8 goals in 20 appearances this season including 2 in Europa League qualifying.",notes:"ECI 216/249 on par with Preston, Huddersfield. Raw but has all attributes with good coaching. Europa League qualifying experience. Comfortable on both feet.",technical:{score:7,notes:"Good touch, clinical"},tactical:{score:6,notes:"Direct, can press from front"},physical:{score:8,notes:"Strong and physical, good pace"},mental:{score:6,notes:"Raw but promising"},leagueQuality:{level:"Mid",notes:"Allsvenskan (Elfsborg). ECI 216. EL qualifying.",eciRanking:"216",eloRanking:"249"},recommendation:{verdict:"MONITOR",priority:"MEDIUM",suitableMarket:"Championship / Belgium / Netherlands",rationale:"0.80 G+A per 90. Young Ghanaian ST. Contract to 2027.",clubRecommendations:[]},videoUrl:"https://vimeo.com/993701604/7aceeed41b",transfermarktUrl:"https://www.transfermarkt.co.uk/jalal-abdulai/profil/spieler/1152491",fbrefUrl:"",status:"Monitoring",source:"TBC",addedBy:"Tony Verinder",dateAdded:"01/02/2026"},
  {id:"csv_41",name:"Alioune Ndoye",dob:"05/10/2001",nationality:"Senegal",currentClub:"Valmiera FC",position:"ST",foot:"Right",height:"1.91m",weight:"77kg",international:"",transferFee:"TBC",contractExpiry:"",description:"Ndoye is a tall and strong centre forward at Valmiera in Latvia's Virsliga. He has scored 22 and assisted 5 in 67 appearances at a rate of 0.69 goals/assists per 90. He helped the club win the Latvian title in 2022. He is excellent in the air and has the intelligence to find space between and across defenders.",notes:"ECI/Elo 591/566 - one of lowest standards in Europe. History of knee issues - check current status. Worth proposing to Concarneau. European qualification experience.",technical:{score:6,notes:"Good link up play"},tactical:{score:6,notes:"Finds space well"},physical:{score:7,notes:"Tall, strong, excellent in the air"},mental:{score:6,notes:""},leagueQuality:{level:"Low",notes:"Latvian Virsliga (Valmiera). ECI 591.",eciRanking:"591",eloRanking:"566"},recommendation:{verdict:"MONITOR",priority:"LOW",suitableMarket:"France Ligue 2 / Belgium / Netherlands",rationale:"Latvian ST. Low league standard. Knee history. Propose to Concarneau.",clubRecommendations:[]},videoUrl:"https://vimeo.com/926557836/0835d53809?share=copy",transfermarktUrl:"https://www.transfermarkt.co.uk/alioune-ndoye/profil/spieler/807124",fbrefUrl:"",status:"Monitoring",source:"TBC",addedBy:"Tony Verinder",dateAdded:"01/02/2026"},
  {id:"csv_42",name:"Thiago Vecino",dob:"25/02/1999",nationality:"Uruguay/Italy",currentClub:"Velez Sarsfield",position:"ST",foot:"Left",height:"1.82m",weight:"83kg",international:"U20s",transferFee:"TBC",contractExpiry:"31/12/2027",description:"Thiago is a well rounded centre forward at Sarsfield in Argentina. He has scored 35 and assisted 16 in 139 appearances at a rate of 0.75 goals/assists per 90. He won three Uruguayan league titles before joining Sarsfield in January 2024. He offers intelligent movement in and around the box and excels at finding space in the area to finish. He can go in behind or drop deep to link play.",notes:"Joined Sarsfield from Liverpool (Uruguay) for EUR 1.1m. Italian passport is an asset for EU placement. Former Uruguayan youth international.",technical:{score:7,notes:"Good movement in box, composed finisher"},tactical:{score:7,notes:"Intelligent movement, can go in behind or link play"},physical:{score:7,notes:"Good athleticism"},mental:{score:7,notes:""},leagueQuality:{level:"High",notes:"Argentina Primera Division (Velez Sarsfield). 3x Uruguayan champion.",eciRanking:"",eloRanking:""},recommendation:{verdict:"MONITOR",priority:"LOW",suitableMarket:"Serie A / La Liga",rationale:"Italian passport, Argentine league. 0.75 G+A per 90.",clubRecommendations:[]},videoUrl:"https://vimeo.com/926615531/d1ed42b73e?share=copy",transfermarktUrl:"https://www.transfermarkt.co.uk/thiago-vecino/profil/spieler/589527",fbrefUrl:"",status:"Monitoring",source:"TBC",addedBy:"Tony Verinder",dateAdded:"01/02/2026"},
  {id:"csv_43",name:"Ioannis Pittas",dob:"10/07/1996",nationality:"Cyprus",currentClub:"AIK",position:"ST",foot:"Right",height:"1.80m",weight:"72kg",international:"41 caps, 6 goals",transferFee:"TBC",contractExpiry:"30/11/2025",description:"Pittas is a mobile and clinical centre forward at AIK in Sweden's Allsvenskan with 80 goals and 14 assists in 237 appearances at a rate of 0.54 goals/assists per 90. He previously fired Apollon Limassol to the Cypriot league title. He offers good pace, intelligent movement and is capable of scoring all types of goals. He has Europa League and Conference League experience.",notes:"ECI/Elo 300/393 on par with Aberdeen, Rosenborg. Joined AIK for EUR 900k in July 2023. 11 goals and 1 assist in 19 appearances this season. Mandated.",technical:{score:7,notes:"Clinical, can score all types of goals"},tactical:{score:7,notes:"Good pace, intelligent movement"},physical:{score:7,notes:"Mobile"},mental:{score:7,notes:"Seasoned international"},leagueQuality:{level:"Mid",notes:"Allsvenskan (AIK). ECI 300. EL/UECL experience.",eciRanking:"300",eloRanking:"393"},recommendation:{verdict:"MONITOR",priority:"MEDIUM",suitableMarket:"Championship / Belgium",rationale:"Experienced Cypriot international ST. 80 career goals. Contract Nov 2025.",clubRecommendations:[]},videoUrl:"https://vimeo.com/988517552/4b0a0ee45a",transfermarktUrl:"https://www.transfermarkt.co.uk/ioannis-pittas/profil/spieler/380191",fbrefUrl:"",status:"Monitoring",source:"Mandated",addedBy:"AV",dateAdded:"01/02/2026"},
  {id:"csv_44",name:"Daniel Ohaleta",dob:"20/06/2007",nationality:"Nigeria",currentClub:"Burna Boy Football Academy",position:"ST",foot:"Right",height:"",weight:"",international:"",transferFee:"TBC",contractExpiry:"",description:"Daniel is a young and powerful centre forward at the Burna Boy Football Academy. He offers an exciting combination of excellent strength and athleticism combined with dynamic movement and impressive pace. He has the ability to hold the ball up and hold off defenders to bring team mates into the game. He is equally capable running the channels and exploiting space in behind.",notes:"Top scorer in the previous 1863 scouting tournament. 1 goal in the most recent event. Aggressive and powerful no.9. Good link play, direct, can finish. 1863 player.",technical:{score:6,notes:"Composed in front of goal"},tactical:{score:6,notes:"Holds ball up well, good link play"},physical:{score:7,notes:"Excellent strength and athleticism, impressive pace"},mental:{score:6,notes:""},leagueQuality:{level:"Low",notes:"Burna Boy Football Academy, Nigeria",eciRanking:"",eloRanking:""},recommendation:{verdict:"MONITOR",priority:"MEDIUM",suitableMarket:"Northern Europe / Scandinavia",rationale:"Top scorer at 1863 scouting tournament. Powerful Nigerian ST.",clubRecommendations:[]},videoUrl:"https://vimeo.com/940866111/274509146e",transfermarktUrl:"",fbrefUrl:"",status:"Monitoring",source:"1863 Player",addedBy:"AV",dateAdded:"01/02/2026"},
  {id:"csv_45",name:"Goforth Amedu",dob:"14/09/2006",nationality:"Nigeria",currentClub:"Bayelsa United (on loan from FC One Rocket)",position:"DM",foot:"Right",height:"",weight:"",international:"",transferFee:"TBC",contractExpiry:"",description:"Goforth played on loan in the NPFL for Bayelsa United, primarily as a defensive midfielder. Dominant and aggressive, he can control the game from centre back or midfield equally well. He is composed in and out of possession, excels at breaking up play and defends on the front foot with a good read of the game.",notes:"Watford interested but no invitation letter yet so available. Molde also interested. Would be excellent CB partner for Leonard Ngenge. UK visa required. 1863 player.",technical:{score:6,notes:""},tactical:{score:7,notes:"Excellent read of the game, breaks up play"},physical:{score:7,notes:"Dominant and aggressive"},mental:{score:7,notes:"Composed in and out of possession"},leagueQuality:{level:"Low",notes:"Nigerian Premier League (Bayelsa United on loan)",eciRanking:"",eloRanking:""},recommendation:{verdict:"MONITOR",priority:"MEDIUM",suitableMarket:"Scandinavia / Scotland",rationale:"Watford and Molde interested. Versatile DM/CB.",clubRecommendations:[]},videoUrl:"https://vimeo.com/1015445361/8d6f31aa6a",transfermarktUrl:"https://www.transfermarkt.co.uk/goforth-amedu/profil/spieler/1305315",fbrefUrl:"",status:"Monitoring",source:"1863 Player",addedBy:"AV",dateAdded:"01/02/2026"},
  {id:"csv_46",name:"Ugurcan Cakir",dob:"05/04/1996",nationality:"Turkey",currentClub:"Trabzonspor",position:"GK",foot:"Right",height:"1.91m",weight:"78kg",international:"26 caps",transferFee:"TBC",contractExpiry:"30/06/2027",description:"Ugurcan is a tall and talented goalkeeper who captains Trabzonspor in the Turkish Super League. He has kept 64 clean sheets in 222 appearances and led the club to their first Turkish league title in almost 40 years in 2022. He displays superb footwork combined with excellent reflexes and impressive shot stopping. He is one of the best keepers in Europe for coming off his line.",notes:"ECI/Elo 124/187 on par with Luton, Nantes, Monza. Previously linked with Chelsea and Liverpool. Has Turkish Cup and Super Cup wins. Europa League experience. Mandated.",technical:{score:8,notes:"Superb footwork, excellent reflexes, shot stopping"},tactical:{score:8,notes:"Best in Europe for closing angle, launching counters"},physical:{score:7,notes:"Tall, commanding presence"},mental:{score:7,notes:"Captain of Trabzonspor"},leagueQuality:{level:"High",notes:"Turkish Super League (Trabzonspor, champions 2022). ECI 124.",eciRanking:"124",eloRanking:"187"},recommendation:{verdict:"MONITOR",priority:"MEDIUM",suitableMarket:"Premier League / Bundesliga",rationale:"Turkish GK captain. 64 clean sheets. Contract June 2027.",clubRecommendations:[]},videoUrl:"https://vimeo.com/926397708/822317c64f?share=copy",transfermarktUrl:"https://www.transfermarkt.co.uk/ugurcan-cakir/profil/spieler/292199",fbrefUrl:"",status:"Monitoring",source:"Mandated",addedBy:"Tony Verinder",dateAdded:"01/02/2026"},
  {id:"csv_47",name:"Alex Paulsen",dob:"04/07/2002",nationality:"New Zealand",currentClub:"Lechia Gdansk (on loan from Bournemouth)",position:"GK",foot:"Right",height:"1.93m",weight:"",international:"Senior Squad",transferFee:"£1,000,000",contractExpiry:"30/06/2027",description:"Alex is a young and promising shot stopper who plays for Wellington Phoenix in Australia's A-League. He has impressed in his debut season as number 1 with 8 clean sheets in 19 appearances. He has conceded the fewest goals in the league this season and has one of the highest save percentages (82%). He is an assertive and confident keeper who is decisive in his decision making and has excellent reflexes.",notes:"Signed three-year contract extension in November 2023. Prevents a league-high 0.48 goals per game. Recently called up to the All Whites senior squad. Mandated.",technical:{score:7,notes:"Excellent reflexes, high save percentage (82%)"},tactical:{score:6,notes:"Assertive, decisive decision maker, comfortable off his line"},physical:{score:7,notes:"1.93m, athletic"},mental:{score:7,notes:"Confident, penalty-saving habit"},leagueQuality:{level:"Mid",notes:"A-League (Wellington Phoenix)",eciRanking:"",eloRanking:""},recommendation:{verdict:"MONITOR",priority:"MEDIUM",suitableMarket:"Championship / Scandinavia / Scotland",rationale:"Young NZ GK, top save % in A-League. Senior international.",clubRecommendations:[]},videoUrl:"https://vimeo.com/925176768?share=copy",transfermarktUrl:"https://www.transfermarkt.co.uk/alex-paulsen/profil/spieler/617009",fbrefUrl:"",status:"Monitoring",source:"Mandated",addedBy:"Tony Verinder",dateAdded:"01/02/2026"},
  {id:"csv_48",name:"Jindrich Stanek",dob:"27/04/1996",nationality:"Czech",currentClub:"Slavia Prague",position:"GK",foot:"Right",height:"1.93m",weight:"90kg",international:"14 caps",transferFee:"TBC",contractExpiry:"30/06/2029",description:"An Everton academy graduate, Jindrich is widely regarded as the best goalkeeper in the Czech top flight. He previously won the Czech title with Viktoria Plzen (43 clean sheets in 119 appearances) before moving to Slavia Prague in January 2024. He has cemented his position as the league's best keeper with 21 clean sheets in 41 appearances and won the title again with Slavia. He has a commanding presence and is a composed shot stopper.",notes:"Signed for Slavia from Plzen at start of January 2024 for €1m. Similar to Schmeichel in his ability to spread himself midair. Czech international - will be in squad for World Cup play offs in March. Europa League and Champions League experience. Mandated.",technical:{score:8,notes:"Excellent shot stopping, great distribution"},tactical:{score:7,notes:"Commanding, comfortable off his line, sweeps"},physical:{score:7,notes:"1.93m/90kg, strong aerial command"},mental:{score:8,notes:"Composed, commanding presence"},leagueQuality:{level:"High",notes:"Czech First League (Slavia Prague, champions). EL/UCL experience.",eciRanking:"",eloRanking:""},recommendation:{verdict:"MONITOR",priority:"MEDIUM",suitableMarket:"Premier League / Bundesliga",rationale:"Best GK in Czech league. 21 clean sheets. Czech international. Contract 2029.",clubRecommendations:[]},videoUrl:"https://vimeo.com/925175132/55da762e8d?share=copy",transfermarktUrl:"https://www.transfermarkt.com/jindrich-stanek/profil/spieler/242089",fbrefUrl:"",status:"Monitoring",source:"Mandated",addedBy:"Tony Verinder",dateAdded:"01/02/2026"},
  {id:"csv_59",name:"Tahir Maigana",dob:"30/06/2008",nationality:"Nigeria",currentClub:"Wireless FC",position:"RW",foot:"Left",height:"1.67m",weight:"",international:"Nigeria U20 - U20 AFCON 2025 (bronze), U20 World Cup 2025",transferFee:"TBC",contractExpiry:"",description:"Tahir is a young and exciting right winger who currently plays for Wireless FC in Abuja, Nigeria. A naturally gifted left-footer who operates from the right flank, he has an extraordinary story having risen from an IDP camp in Maiduguri, Borno State to represent Nigeria on the world stage. He played all six games at the 2025 U20 AFCON in Egypt, helping Nigeria win the bronze medal, before earning his place in the Flying Eagles squad for the 2025 FIFA U20 World Cup in Chile where he started all four of Nigeria's matches — including the quarter-final against Argentina. At the World Cup he registered 13 shots and a 76.1% pass accuracy across the four games. He is celebrated for his creativity, vision and ability to unlock defences with his left foot, making him a constant threat cutting in from the right. His direct style, low centre of gravity and quick feet allow him to beat defenders in one-on-one situations and he has the ability to create chances for team mates in the final third.",notes:"Remarkable story — from IDP camp in Maiduguri to the U20 World Cup. His selection by coach Aliyu Zubairu underscores his potential. Listed on Sofascore as linked to Capital City FC. UK visa would be required. A player to move quickly on given his World Cup profile raising his market value.",technical:{score:7,notes:"Naturally gifted left-footer, creative, good vision"},tactical:{score:6,notes:"Understands how to use width and cut inside effectively"},physical:{score:7,notes:"Quick feet, low centre of gravity, direct style"},mental:{score:7,notes:"Exceptional resilience and hunger — IDP camp to World Cup"},leagueQuality:{level:"Low",notes:"Wireless FC, Nigeria. U20 World Cup quarter-finalist 2025.",eciRanking:"",eloRanking:""},recommendation:{verdict:"MONITOR",priority:"HIGH",suitableMarket:"Scandinavia / Belgium / Netherlands",rationale:"U20 World Cup starter (Nigeria 2025). Left-footed RW. Young profile with exceptional upside. Move quickly.",clubRecommendations:[]},videoUrl:"",transfermarktUrl:"https://www.transfermarkt.co.uk/tahir-maigana/profil/spieler/1401545",fbrefUrl:"",status:"Monitoring",source:"1863 Player",addedBy:"AV",dateAdded:"23/03/2026"},
  {id:"csv_49",name:"Clayton Taylor",dob:"01/03/2004",nationality:"Australia",currentClub:"Newcastle Jets",position:"LW",foot:"Right",height:"1.75m",weight:"",international:"",transferFee:"TBC",contractExpiry:"30/06/2026",description:"Clayton is an exciting young winger for Newcastle Jets in Australia's A-League. In his debut season he scored 7 and assisted 3 in 23 appearances (19 starts) at a rate of 0.55 goals/assists per 90. An excellent technician, Clayton is comfortable on either foot and has the quality and vision to create chances for team mates. He offers good pace, intelligent movement and can both score and assist.",notes:"Tony Rallis player. Joined Newcastle from Sydney on free transfer July 2023. Signed contract extension January 2024. Reported interest from a club in Norway. Mandated.",technical:{score:7,notes:"Comfortable on either foot, good vision"},tactical:{score:6,notes:"Intelligent movement"},physical:{score:7,notes:"Good pace"},mental:{score:7,notes:""},leagueQuality:{level:"Mid",notes:"A-League (Newcastle Jets, Australia)",eciRanking:"",eloRanking:""},recommendation:{verdict:"MONITOR",priority:"MEDIUM",suitableMarket:"Scandinavia / Belgium / Netherlands",rationale:"Young Australian winger. 7G 3A in debut season. Norwegian interest.",clubRecommendations:[]},videoUrl:"https://vimeo.com/940502412/659727dc4f?share=copy",transfermarktUrl:"https://www.transfermarkt.co.uk/clayton-taylor/profil/spieler/1109827",fbrefUrl:"",status:"Monitoring",source:"Mandated",addedBy:"Tony Verinder",dateAdded:"01/02/2026"},
  {id:"csv_50",name:"Roman Dixon",dob:"26/04/2004",nationality:"England",currentClub:"Everton",position:"RB",foot:"Right",height:"",weight:"",international:"U16s",transferFee:"Training Compensation - £400k Cat 1 / £280k Cat 2",contractExpiry:"30/06/2024",description:"Roman is a quick and athletic right back who plays for Everton's U18s. He joined the club when he was 11 and has gone on to score 1 and assist 1 in 39 appearances for the U18s as well as making 21 appearances for the U23s. He is very good going forward with the ball at his feet and his pace and athleticism allow him to track back quickly. He has the versatility to operate anywhere down the right flank.",notes:"Signed first professional contract January 2022. Rated highly at Everton. Pathway blocked by Seamus Coleman and Nathan Patterson. Keen to move for first team football. England U16 international. Mandated.",technical:{score:7,notes:"Good with the ball at his feet"},tactical:{score:6,notes:"Versatile down right flank"},physical:{score:7,notes:"Quick, athletic, tracks back quickly"},mental:{score:6,notes:""},leagueQuality:{level:"Elite",notes:"Everton Academy (Premier League)",eciRanking:"",eloRanking:""},recommendation:{verdict:"MONITOR",priority:"HIGH",suitableMarket:"Championship / League One",rationale:"Everton academy RB, England U16. Training compensation. Wants first team.",clubRecommendations:[]},videoUrl:"https://vimeo.com/926382077/cc5601a8b9?share=copy",transfermarktUrl:"https://www.transfermarkt.co.uk/roman-dixon/profil/spieler/856479",fbrefUrl:"",status:"Monitoring",source:"Mandated",addedBy:"Tony Verinder",dateAdded:"01/02/2026"},
  {id:"csv_51",name:"Francisco Gonzalez",dob:"06/04/2001",nationality:"Argentina",currentClub:"Newell's Old Boys",position:"RW",foot:"Left",height:"1.70m",weight:"70kg",international:"U20s and U23s",transferFee:"TBC",contractExpiry:"31/12/2025",description:"Gonzalez is an energetic winger at Newell's Old Boys in Argentina. He has 6 goals and 13 assists in 89 appearances at a rate of 0.32 goals/assists per 90. An industrious winger capable of playing on either flank, he can stretch the game by running in behind and offers good delivery from wide areas. He has an impressive work rate and strong technical ability.",notes:"Agent has full control of the player. Newell's reportedly want to sell him, Independiente have had initial bid rejected. Played in Olympics qualifiers but didn't make final squad. Mandated by AV.",technical:{score:7,notes:"Good delivery, technical ability"},tactical:{score:6,notes:"Can play on either flank"},physical:{score:7,notes:"Industrious, impressive work rate"},mental:{score:6,notes:""},leagueQuality:{level:"High",notes:"Argentina Primera Division (Newell's Old Boys)",eciRanking:"",eloRanking:""},recommendation:{verdict:"MONITOR",priority:"MEDIUM",suitableMarket:"Spain / Portugal / Italy",rationale:"Argentine winger, 6G 13A. Contract Dec 2025. Olympics qualifier.",clubRecommendations:[]},videoUrl:"https://vimeo.com/988501947/3fffa39671",transfermarktUrl:"https://www.transfermarkt.co.uk/francisco-gonzalez/profil/spieler/703564",fbrefUrl:"",status:"Monitoring",source:"Mandated",addedBy:"AV",dateAdded:"01/02/2026"},
  {id:"csv_52",name:"Lukas Provod",dob:"23/10/1996",nationality:"Czech",currentClub:"Slavia Prague",position:"LW",foot:"Right",height:"1.91m",weight:"85kg",international:"18 caps, 2 goals, 1 assist",transferFee:"TBC",contractExpiry:"30/06/2026",description:"Lukas is a tall and versatile player at Slavia Prague. He has scored 15 and assisted 20 in 140 appearances at a rate of 0.36 goals/assists per 90. He helped the club win back-to-back league titles in 2020 and 2021 and topped their Europa League group this season. He has the athleticism and versatility to operate in a number of positions whether down the left flank or in midfield.",notes:"ECI 48 on par with Sevilla, Brentford, Wolves, Stuttgart. Did ACL in May 2021 but fully recovered. His height and stature attractive for English market. Previously linked with Inter. Mandated.",technical:{score:7,notes:"Good vision, creativity, set ball specialist"},tactical:{score:7,notes:"Versatile across left flank and midfield"},physical:{score:7,notes:"Tall, athletic"},mental:{score:7,notes:""},leagueQuality:{level:"High",notes:"Czech First League (Slavia Prague). ECI 48, EL group stage.",eciRanking:"48",eloRanking:""},recommendation:{verdict:"MONITOR",priority:"LOW",suitableMarket:"Premier League / Bundesliga",rationale:"Czech international, UCL/EL experience. Contract June 2026. Ex-Inter target.",clubRecommendations:[]},videoUrl:"https://vimeo.com/926437854/f6b8261431?share=copy",transfermarktUrl:"https://www.transfermarkt.co.uk/lukas-provod/leistungsdaten/spieler/292779/plus/0?saison=ges",fbrefUrl:"",status:"Monitoring",source:"Mandated",addedBy:"Tony Verinder",dateAdded:"01/02/2026"},
  {id:"csv_53",name:"Cobel Sow Garcia",dob:"02/11/2006",nationality:"Spanish/Swiss",currentClub:"FC Basel",position:"LW",foot:"Right",height:"",weight:"",international:"U20s",transferFee:"Training Compensation",contractExpiry:"30/06/2024",description:"The best player of Basel's U21s. A tricky no 10 or winger with a low centre of gravity, he has the ability to turn out of trouble and retain the ball in tight spaces. He can also play wide and excels off the right side with good end product. He scored 16 in 30 appearances last season and has scored 5 and assisted 2 so far this season.",notes:"Awarded Basel U18 Player of the Year. Available for training compensation only. Future PL star in the making per 1863 assessment. Liverpool following him. Cobel can sign a pre-contract in January. Move quickly - offer imminent.",technical:{score:8,notes:"Tricky, turns out of trouble, excellent end product"},tactical:{score:7,notes:"Can play no.10 or wide"},physical:{score:6,notes:"Low centre of gravity"},mental:{score:7,notes:""},leagueQuality:{level:"High",notes:"FC Basel (Swiss Super League U21). Available for training compensation.",eciRanking:"",eloRanking:""},recommendation:{verdict:"MONITOR",priority:"HIGH",suitableMarket:"Premier League / Bundesliga",rationale:"Best Basel U21 player. Training compensation. Liverpool interest. Move fast.",clubRecommendations:[]},videoUrl:"https://vimeo.com/926437956/785265dd88?share=copy",transfermarktUrl:"https://www.transfermarkt.co.uk/cobel-sow-garcia/profil/spieler/925229",fbrefUrl:"",status:"Monitoring",source:"TBC",addedBy:"Tony Verinder",dateAdded:"01/02/2026"},
  {id:"csv_54",name:"Damian Boon",dob:"26/04/2008",nationality:"Netherlands",currentClub:"Volendam",position:"LW",foot:"Right",height:"1.69m",weight:"57kg",international:"",transferFee:"Training Compensation",contractExpiry:"",description:"Damian is an exciting young prospect in Volendam's youth setup. He is a skilful and technical winger who can operate on either flank. He has the ability to beat opponents with great pace, agility and ball control. He excels at running at defenders and offers dynamic movement both with and without the ball.",notes:"Extremely highly rated young winger. Recently invited to trial by AS Roma. Available for small training compensation. One to follow or possibly loan at 16.",technical:{score:7,notes:"Excellent ball control, tricky"},tactical:{score:6,notes:"Can play on either flank"},physical:{score:7,notes:"Great pace and agility"},mental:{score:6,notes:""},leagueQuality:{level:"High",notes:"Volendam youth (Eredivisie). Roma trial.",eciRanking:"",eloRanking:""},recommendation:{verdict:"MONITOR",priority:"MEDIUM",suitableMarket:"Netherlands / Belgium / Premier League",rationale:"Dutch winger, Roma trial. Training compensation. Age 15.",clubRecommendations:[]},videoUrl:"https://www.youtube.com/watch?v=SMREDqlr9y8",transfermarktUrl:"",fbrefUrl:"",status:"Monitoring",source:"TBC",addedBy:"Tony Verinder",dateAdded:"01/02/2026"},
  {id:"csv_55",name:"Yusuf Abdulazeez",dob:"09/03/2002",nationality:"Nigeria",currentClub:"Mjallby AIF (on loan at Varbergs)",position:"RW",foot:"Both",height:"1.83m",weight:"77kg",international:"U23s",transferFee:"TBC",contractExpiry:"31/12/2025",description:"Yusuf is an athletic and technical winger at Mjallby in Sweden's Allsvenskan. Previously at Gombe United where he scored 20 in 53 appearances, he moved to Mjallby in August 2022. He spent last season on loan at Skovde where he scored 7 and assisted 3 in 21 appearances including scoring in the relegation play-offs. Comfortable on either foot, he can operate on both flanks.",notes:"ECI/Elo 335/353 on par with Aberdeen, Excelsior. On loan at Varbergs in the Superettan. Contract December 2025.",technical:{score:6,notes:"Good technical ability, comfortable on either foot"},tactical:{score:6,notes:"Can operate on both flanks"},physical:{score:7,notes:"Athletic, pace to stretch defences"},mental:{score:6,notes:""},leagueQuality:{level:"Mid",notes:"Superettan (Varbergs, on loan from Mjallby). ECI 335.",eciRanking:"335",eloRanking:"353"},recommendation:{verdict:"MONITOR",priority:"MEDIUM",suitableMarket:"Scandinavia / Belgium",rationale:"Nigerian winger, comfortable on either foot. Contract Dec 2025.",clubRecommendations:[]},videoUrl:"https://vimeo.com/926438325/afb5094dce?share=copy",transfermarktUrl:"https://www.transfermarkt.co.uk/yusuf-abdulazeez/profil/spieler/688770",fbrefUrl:"",status:"Monitoring",source:"TBC",addedBy:"Tony Verinder",dateAdded:"01/02/2026"},
  {id:"csv_56",name:"Waris Adesanya",dob:"21/10/2007",nationality:"Nigeria",currentClub:"Box To Box Football Academy",position:"RW",foot:"Right",height:"",weight:"",international:"",transferFee:"TBC",contractExpiry:"",description:"Waris is one of the quickest young wingers in Southern Nigeria. He plays for the Box To Box Football Academy in Lagos and has already caught the attention of clubs in England. Comfortable on either flank, he offers raw pace and acceleration that can beat opponents in one-on-one situations. His direct style is a consistent threat on the break.",notes:"Previously identified by Guy at 1863's Lagos event. Turned down opportunity at Sporting Lisbon for Leeds trial but trial never materialised. Leeds unable to accommodate. UK visa required. 1863 player.",technical:{score:6,notes:"Direct style"},tactical:{score:5,notes:""},physical:{score:8,notes:"One of quickest young wingers in Southern Nigeria"},mental:{score:6,notes:""},leagueQuality:{level:"Low",notes:"Box To Box Football Academy, Lagos",eciRanking:"",eloRanking:""},recommendation:{verdict:"MONITOR",priority:"MEDIUM",suitableMarket:"Championship / League One / Scandinavia",rationale:"Rapid Nigerian winger. Turned down Sporting Lisbon. Leeds interest.",clubRecommendations:[]},videoUrl:"https://vimeo.com/1015445344/7be343d541",transfermarktUrl:"",fbrefUrl:"",status:"Monitoring",source:"1863 Player",addedBy:"AV",dateAdded:"01/02/2026"},
  {id:"csv_57",name:"Rui Modesto",dob:"07/10/1999",nationality:"Angola/Portugal",currentClub:"AIK",position:"RW",foot:"Right",height:"1.81m",weight:"78kg",international:"2 caps for Angola",transferFee:"TBC",contractExpiry:"31/12/2025",description:"Modesto is a versatile wide player at AIK in Sweden's Allsvenskan with 13 goals and 9 assists in 52 appearances at a rate of 0.43 goals/assists per 90. He previously won the Finnish Cup with FC Honka. He is capable of playing on either flank or at full back and makes progressive runs into promising positions in the opposition area.",notes:"ECI/Elo 300/393 on par with Aberdeen, Rosenborg. Aarhus rumoured to be in talks to sign him. 3 goals and 5 assists in 13 appearances this season. Mandated by AV.",technical:{score:7,notes:"Good technical ability, crossing, finding a pass"},tactical:{score:7,notes:"Versatile - either flank or full back"},physical:{score:7,notes:"Athletic"},mental:{score:6,notes:""},leagueQuality:{level:"Mid",notes:"Allsvenskan (AIK). ECI 300.",eciRanking:"300",eloRanking:"393"},recommendation:{verdict:"MONITOR",priority:"MEDIUM",suitableMarket:"Championship / Scandinavia",rationale:"Versatile Angolan winger. 3G 5A this season. Contract Dec 2025.",clubRecommendations:[]},videoUrl:"https://vimeo.com/988533772/4091723043",transfermarktUrl:"https://www.transfermarkt.co.uk/rui-modesto/profil/spieler/671799",fbrefUrl:"",status:"Monitoring",source:"Mandated",addedBy:"AV",dateAdded:"01/02/2026"},
  {id:"csv_58",name:"Buba Sanneh",dob:"03/11/2007",nationality:"English/Gambian",currentClub:"Nottingham Forest",position:"RB",foot:"Right",height:"",weight:"",international:"",transferFee:"TBC",contractExpiry:"30/06/2027",description:"Buba is a young and talented right back who currently plays for Nottingham Forest's U18s and has featured for the U21s. He is a quick and agile full back who offers excellent athleticism up and down the flank. He is quick in the tackle, responsive in one-on-one defensive situations and can gain territory with runs into space to get into crossing and cut back positions. He has captained the U18s and has the versatility to play as a defensive midfielder. He has been included in Nottingham Forest's Europa League squad list for 2025/26.",notes:"Included in Nottingham Forest's UEFA Europa League squad for 2025/26, reflecting how highly the club rate him. A good interview video available from Sky Sports on his beliefs and discipline. Has the versatility to play as a defensive midfielder. 1863 player.",technical:{score:7,notes:"Quick feet, good crossing ability"},tactical:{score:6,notes:"Versatile - RB or DM"},physical:{score:8,notes:"Excellent pace and athleticism"},mental:{score:7,notes:"Natural leader, captained the U18s"},leagueQuality:{level:"Elite",notes:"Nottingham Forest Academy (Premier League). In Europa League squad 2025/26.",eciRanking:"",eloRanking:""},recommendation:{verdict:"MONITOR",priority:"HIGH",suitableMarket:"Premier League / Championship",rationale:"Highly rated Forest academy RB. Europa League squad inclusion at 18. Strong development trajectory."},videoUrl:"https://vimeo.com/1159241252/3439c100e4?fl=tl&fe=ec",transfermarktUrl:"https://www.transfermarkt.co.uk/buba-sanneh/profil/spieler/1310166",fbrefUrl:"",status:"Signed",source:"1863 Player",addedBy:"Tony Verinder",dateAdded:"01/02/2026"},
  {id:"csv_60",name:"Ersin Destanoglu",dob:"01/01/2001",nationality:"Turkey",currentClub:"Besiktas",position:"GK",foot:"Right",height:"1.95m",weight:"",international:"Senior Squad (uncapped)",transferFee:"Free Transfer",contractExpiry:"30/06/2026",description:"Destanoglu is a tall and commanding shot stopper who has been Besiktas's number one since 2020. He has kept 45 clean sheets in 146 appearances as he has helped the club win one league title and two domestic cups. He is a ball playing keeper who can build play from the back as well as sweeping to cover a high line. He is capable of making all types of stops and earned praise for his high save volume performances in the Champions League. He has made Turkey's senior squad but is yet to make his debut. He is available on a free transfer and already has interest from a number of clubs across the continent.",notes:"Available on a free transfer this summer. Champions League experience. High ceiling — Turkey's next number one.",technical:{score:7,notes:"Strong distribution, comfortable on ball"},tactical:{score:7,notes:"Good sweeper, covers high line well"},physical:{score:8,notes:"1.95m — commanding presence"},mental:{score:7,notes:"Proven leader, Besiktas #1 since 2020"},leagueQuality:{level:"Medium",notes:"Turkish Super League — Champions League group stage experience"},recommendation:{verdict:"MONITOR",priority:"HIGH",suitableMarket:"Premier League / Championship / Bundesliga",rationale:"Free transfer this summer. UCL experience. Uncapped but in Turkey squad."},videoUrl:"https://vimeo.com/1169718043/2055a28c13",transfermarktUrl:"https://www.transfermarkt.com/ersin-destanoglu/profil/spieler/351575",fbrefUrl:"",status:"Monitoring",source:"1863 Player",addedBy:"AV",dateAdded:"17/06/2026"},
  {id:"csv_61",name:"Matej Hadas",dob:"25/11/2003",nationality:"Czech",currentClub:"Sigma Olomouc",position:"RB",foot:"Right",height:"",weight:"",international:"U17s, U19s, U20s, U21s",transferFee:"EUR 600-700,000",contractExpiry:"30/06/2030",description:"Hadas is a young and reliable right back who currently plays for Sigma Olomouc in the Czech top flight. He has made 78 appearances for the club and helped them win the Czech Cup in 2025 for only the second time in their history. Capable of supporting play in both ends of the pitch, Hadas displays good athleticism combined with technical ability and defensive awareness. He understands when to push forward to support the attack and has a good delivery when overlapping and underlapping. He is responsive in one-on-one defensive actions, he has Europa Conference League experience and he has been a Czech youth international at every level.",notes:"From the Zikas who say he is a solid right back suitable for clubs in Scotland and the Championship. Earns around EUR 7-8k net per month which might price him out of most Scottish clubs.",technical:{score:7,notes:"Good delivery, comfortable on ball"},tactical:{score:7,notes:"Strong understanding of when to support attack"},physical:{score:7,notes:"Good athleticism"},mental:{score:7,notes:"Consistent performer"},leagueQuality:{level:"Medium",notes:"Czech First League — Conference League experience"},recommendation:{verdict:"MONITOR",priority:"MEDIUM",suitableMarket:"Scotland / Championship",rationale:"EUR 600-700k. Zikas connection. Czech Cup winner 2025."},videoUrl:"https://vimeo.com/1202067139/5221a4c501",transfermarktUrl:"https://www.transfermarkt.com/matej-hadas/profil/spieler/652050",fbrefUrl:"",status:"Monitoring",source:"1863 Player",addedBy:"AV",dateAdded:"17/06/2026"},
  {id:"csv_62",name:"Israel Joseph",dob:"17/05/2005",nationality:"Nigeria",currentClub:"Abia Warriors",position:"LB",foot:"Left",height:"1.78m",weight:"",international:"",transferFee:"Free transfer / nominal fee plus sell on",contractExpiry:"",description:"Israel is a young and technical left back who currently plays for Abia Warriors in Nigeria. He is an attack-minded full back who has great pace and athleticism. He excels with the ball at his feet and he links up well with the forward line. He is highly regarded in Nigeria and looks set for a bright future.",notes:"Has performed really well in his debut NPFL season and is likely to be called up to the Nigerian U20 setup.",technical:{score:6,notes:"Good with ball, technical ability"},tactical:{score:6,notes:"Attack-minded, good link-up"},physical:{score:7,notes:"Pace and athleticism"},mental:{score:6,notes:"Bright future"},leagueQuality:{level:"Low",notes:"Nigerian Premier League"},recommendation:{verdict:"MONITOR",priority:"MEDIUM",suitableMarket:"Scandinavia / Eastern Europe",rationale:"Free/nominal fee. Attack-minded LB. U20 potential."},videoUrl:"https://1drv.ms/v/s!Ar7mhA3iXlCDjySvMGtpBPuD7LYW",transfermarktUrl:"",fbrefUrl:"",status:"Monitoring",source:"1863 Player",addedBy:"AV",dateAdded:"17/06/2026"},
  {id:"csv_63",name:"Daniel Thuram",dob:"31/03/2009",nationality:"Brazil",currentClub:"Flamengo",position:"CB",foot:"Right",height:"1.86m",weight:"",international:"",transferFee:"TBC (EUR 50m release clause)",contractExpiry:"31/12/2029",description:"Daniel Thuram is a 17-year-old centre-back considered one of the standout prospects in South American youth football. Operating primarily for Flamengo's U17 and U20 sides, his nickname is a deliberate tribute to legendary French defender Lilian Thuram, reflecting the level of expectation placed on him within the club. He combines physical presence with composure in possession and an above-average reading of the game for his age. He has already received his first senior appearance in Flamengo's 8-0 Campeonato Carioca win. At U20 level in the 2026 CONMEBOL Libertadores, Flamengo progressed through the group stage unbeaten with Thuram featuring regularly as a starter.",notes:"Through Luca. EUR 50million release clause — Arsenal reportedly interested. Cannot move before summer 2027 (under 18).",technical:{score:7,notes:"Composure on ball, good distribution"},tactical:{score:7,notes:"Above-average reading of game for his age"},physical:{score:8,notes:"Strong physical presence at 1.86m, 17 years old"},mental:{score:8,notes:"Named after Lilian Thuram — enormous expectations"},leagueQuality:{level:"High",notes:"Flamengo, Brazil Serie A. CONMEBOL U20 Libertadores starter."},recommendation:{verdict:"MONITOR",priority:"HIGH",suitableMarket:"Monitor — move not possible until 2027",rationale:"EUR 50m release clause. Arsenal interest. Cannot move until 2027. Monitor closely through Luca."},videoUrl:"https://vimeo.com/1187849344/54eeab40d6",transfermarktUrl:"",fbrefUrl:"",status:"Monitoring",source:"1863 Player",addedBy:"AV",dateAdded:"17/06/2026"},
  {id:"csv_64",name:"Abubacarr Kinteh",dob:"30/11/2006",nationality:"Gambia",currentClub:"Tromso IL",position:"CB",foot:"Left",height:"1.86m",weight:"",international:"1 senior cap",transferFee:"TBC",contractExpiry:"31/12/2029",description:"Kinteh is a raw and physically exceptional left-sided central defender who currently plays for Tromso in the Eliteserien. He joined in March 2025 and immediately broke into the first team playing on the left-hand side of Tromso's back three. He has made 30 appearances, helping Tromso finish third last season, and made his senior debut for the Gambian national team. He combines outstanding athleticism and top-end pace with composure in possession, offering both short and long distribution from deep. He is strong in the tackle, can cover quickly and is comfortable bringing the ball out from the back.",notes:"Man Utd, Chelsea, Ajax, PSV, Benfica and Porto reportedly interested. Al-Ahli EUR 8m offer fell through in January. Slavia Prague EUR 5m bid rejected last May. Currently repped by Norwegian-based JAF Sports. Some analysts question defensive consistency in a back three.",technical:{score:7,notes:"Comfortable on ball, short and long distribution"},tactical:{score:6,notes:"Back three can mask errors"},physical:{score:9,notes:"Outstanding athleticism and top-end pace"},mental:{score:7,notes:"Senior debut in first season"},leagueQuality:{level:"Medium",notes:"Norwegian Eliteserien — Tromso finished 3rd"},recommendation:{verdict:"MONITOR",priority:"HIGH",suitableMarket:"Premier League / Bundesliga / Serie A",rationale:"Elite club interest. JAF Sports reps him — mandate opportunity. Physical standout."},videoUrl:"https://vimeo.com/1184848621/cb45e2465c",transfermarktUrl:"https://www.transfermarkt.com/abubacarr-sedi-kinteh/profil/spieler/1385275",fbrefUrl:"",status:"Monitoring",source:"1863 Player",addedBy:"AV",dateAdded:"17/06/2026"},
  {id:"csv_65",name:"Anthony Pantazopoulos",dob:"22/04/2003",nationality:"Australia",currentClub:"Western Sydney Wanderers",position:"CB",foot:"Right",height:"1.87m",weight:"",international:"U23s",transferFee:"£450,000",contractExpiry:"30/06/2027",description:"Anthony is a powerful and versatile defender who currently plays for Western Sydney in Australia's A-League. He has made 56 appearances and has the versatility to play at centre back or as a full back on either flank. He displays impressive athleticism with excellent sprint endurance and recovery. A powerful ball winner who is good in the air, Anthony is a front foot defender comfortable playing off either foot. He is an Australian U23 international.",notes:"Transfer fee around £450k and salary expectations of £3k per week. Versatile — can play CB or either full back position.",technical:{score:6,notes:"Comfortable on ball for a physical defender"},tactical:{score:6,notes:"Versatile across defensive line"},physical:{score:8,notes:"Excellent sprint endurance, powerful in the air"},mental:{score:7,notes:"Front foot defender"},leagueQuality:{level:"Medium",notes:"A-League Australia"},recommendation:{verdict:"MONITOR",priority:"MEDIUM",suitableMarket:"Scotland / League One / Championship",rationale:"£450k. Versatile. A-League proven."},videoUrl:"https://vimeo.com/1077154808/abb729d5d5",transfermarktUrl:"",fbrefUrl:"",status:"Monitoring",source:"1863 Player",addedBy:"AV",dateAdded:"17/06/2026"},
  {id:"csv_66",name:"Tomas Soucek",dob:"27/02/1995",nationality:"Czech",currentClub:"West Ham United",position:"CM",foot:"Right",height:"1.92m",weight:"86kg",international:"91 caps, 17 goals, 5 assists",transferFee:"£10,000,000",contractExpiry:"30/06/2027",description:"Tomas is a vastly experienced Premier League midfielder who currently plays for West Ham United. Soucek won 3 Czech titles, 2 Czech Cups and was player of the year in Czechia four times before moving to West Ham in 2020. He has gone on to score 47 and assist 13 in 284 appearances for the club including helping them win their first ever European trophy in the Europa Conference League in 2023. He is a robust tackler with superb aerial ability and is 8th on the all-time caps list for Czechia with 91 caps. Currently representing his country at the 2026 World Cup.",notes:"Salary expectations around £80k per week. Suitable for anyone in the bottom half of the Premier League. Currently at the World Cup with Czech Republic. Zikas connection.",technical:{score:8,notes:"Conference League winner, 47 PL goals"},tactical:{score:8,notes:"Dominant in both boxes"},physical:{score:8,notes:"1.92m aerial dominance"},mental:{score:9,notes:"91 caps, World Cup participant"},leagueQuality:{level:"High",notes:"Premier League — West Ham. Europa Conference League winner 2023."},recommendation:{verdict:"MONITOR",priority:"HIGH",suitableMarket:"Premier League",rationale:"£10m / £80k week. Bottom-half PL club. Zikas connection."},videoUrl:"https://vimeo.com/1201881054/99f54099c4",transfermarktUrl:"https://www.transfermarkt.com/tomas-soucek/profil/spieler/374702",fbrefUrl:"",status:"Monitoring",source:"1863 Player",addedBy:"AV",dateAdded:"17/06/2026"},
  {id:"csv_67",name:"Lachlan Bayliss",dob:"24/07/2002",nationality:"New Zealand",currentClub:"Newcastle Jets",position:"CM",foot:"Right",height:"1.79m",weight:"",international:"2 senior caps",transferFee:"Free Transfer",contractExpiry:"30/06/2026",description:"Lachlan Bayliss is a dynamic box-to-box central midfielder who currently plays for Newcastle Jets in Australia's A-League. He has 6 goals and 5 assists in 69 appearances (45 starts). He is very mobile and comfortable driving forward with the ball at his feet. He has the skill and technical ability to turn past opponents to create space and an eye for a pass. He scored 5 and assisted 3 in 25 appearances as Newcastle sit top of the A-League.",notes:"Free transfer — training compensation of around £130k due. Salary expectations of £2,500-£3,500 per week. Good option for Scottish Prem, bottom Championship, top League One, Eredivisie or Belgian Pro League.",technical:{score:7,notes:"Good vision, turns past opponents"},tactical:{score:7,notes:"Box-to-box, drives forward"},physical:{score:7,notes:"Mobile and energetic"},mental:{score:7,notes:"2 NZ senior caps"},leagueQuality:{level:"Medium",notes:"A-League — Newcastle Jets top of table"},recommendation:{verdict:"MONITOR",priority:"MEDIUM",suitableMarket:"Scotland / Championship / Eredivisie / Belgian Pro League",rationale:"Free transfer. £130k training comp. Tony Rallis connection (Australia)."},videoUrl:"https://vimeo.com/1081834000/1689092584",transfermarktUrl:"https://www.transfermarkt.com/lachlan-bayliss/profil/spieler/1109358",fbrefUrl:"",status:"Monitoring",source:"1863 Player",addedBy:"AV",dateAdded:"17/06/2026"},
  {id:"csv_68",name:"Giannis Sarris",dob:"20/03/2007",nationality:"Greece",currentClub:"PAOK",position:"DM",foot:"Right",height:"1.92m",weight:"",international:"U17s, U19s",transferFee:"TBC",contractExpiry:"30/06/2029",description:"Sarris is a 19-year-old defensive midfielder with impressive physical stature in the Nemanja Matic mould. He enjoyed a formative spell in Italy with Modena's U17s and U19s before returning to Greece with PAOK. He currently plays for PAOK B displaying the physicality, positional awareness and discipline that attracted them to sign him in January. He has an intelligent tactical awareness and is a Greek youth international.",notes:"Physically imposing at 1.92m. Modena youth background. PAOK signed him January 2026. Matic-type holding midfielder. Long contract to 2029.",technical:{score:6,notes:"Keeps it simple, tidy in possession"},tactical:{score:7,notes:"Excellent positional awareness and discipline"},physical:{score:8,notes:"1.92m imposing frame — dominant aerially"},mental:{score:7,notes:"Mature head, tactically disciplined"},leagueQuality:{level:"Medium",notes:"PAOK B — Greek Super League parent club"},recommendation:{verdict:"MONITOR",priority:"MEDIUM",suitableMarket:"Scandinavia / Eastern Europe / Scottish Prem",rationale:"Young physical DM. PAOK connection. Long contract 2029."},videoUrl:"https://vimeo.com/1188239184/bd8b019f59",transfermarktUrl:"https://www.transfermarkt.com/giannis-sarris/profil/spieler/1052319",fbrefUrl:"",status:"Monitoring",source:"1863 Player",addedBy:"AV",dateAdded:"17/06/2026"},
  {id:"csv_69",name:"Nikola Moro",dob:"12/03/1998",nationality:"Croatia",currentClub:"Bologna",position:"CM",foot:"Right",height:"1.83m",weight:"73kg",international:"9 caps",transferFee:"TBC",contractExpiry:"30/06/2027",description:"Moro is an experienced central midfielder who currently plays for Bologna in Italy's Serie A. He previously won four Croatian league titles with Dinamo Zagreb before moving to Bologna. He has gone on to make 127 appearances for the club helping them qualify for the Champions League and win the Italian Cup. He displays excellent technical ability and excels at progressing play forward with a composed and intricate playing style often play-making from deep. He offers good athleticism, can screen the back line and has the vision to break lines with and without the ball. He has Champions League and Europa League experience.",notes:"Used mainly as a squad player at Bologna, rarely plays a full 90. Champions League experience. 4x Croatian champion with Dinamo Zagreb. Italian Cup winner.",technical:{score:8,notes:"Excellent technical, intricate play-maker from deep"},tactical:{score:8,notes:"Champions League experience, screens and progresses"},physical:{score:7,notes:"Good athleticism, 1.83m"},mental:{score:7,notes:"9 Croatia caps, UCL player"},leagueQuality:{level:"High",notes:"Bologna, Serie A — Champions League participant"},recommendation:{verdict:"MONITOR",priority:"HIGH",suitableMarket:"Premier League / Championship / Bundesliga",rationale:"UCL quality. Croatian international. Squad player at Bologna — available."},videoUrl:"https://vimeo.com/1187868390/a91c4cf80c",transfermarktUrl:"https://www.transfermarkt.com/nikola-moro/profil/spieler/384012",fbrefUrl:"",status:"Monitoring",source:"1863 Player",addedBy:"AV",dateAdded:"17/06/2026"},
  {id:"csv_70",name:"Augustine Chike Mbah",dob:"05/01/2008",nationality:"Nigeria",currentClub:"Bilda Football Academy",position:"RW",foot:"Right",height:"",weight:"",international:"",transferFee:"TBC",contractExpiry:"",description:"Chike is a young and intelligent winger who plays for Bilda Football Academy in Lagos, Nigeria. He displays great pace and acceleration and has a good footballing IQ that allows him to play into space off his first touch. He has the skill and technical ability to go past opponents, can link play and has the awareness to create space for himself and others. He can stretch defences, has an excellent work ethic and can score and create. He can play off either flank and has already attracted the attention of clubs in Europe.",notes:"Holds multi-entry UK visitor visa valid until 8 December 2026 — available to trial. Currently performing well on trial at QPR. Move quickly.",technical:{score:7,notes:"Great pace, good IQ"},tactical:{score:6,notes:"Can play either flank"},physical:{score:7,notes:"Pace and acceleration"},mental:{score:6,notes:"On trial at QPR"},leagueQuality:{level:"Low",notes:"Bilda Football Academy, Lagos Nigeria"},recommendation:{verdict:"MONITOR",priority:"HIGH",suitableMarket:"UK trial — visa available until Dec 2026",rationale:"UK visa until Dec 2026. QPR trial ongoing. Move quickly."},videoUrl:"https://vimeo.com/1201868014/bddf3c4fc8",transfermarktUrl:"",fbrefUrl:"",status:"Monitoring",source:"1863 Player",addedBy:"AV",dateAdded:"17/06/2026"},
  {id:"csv_71",name:"Aborty Liberty",dob:"06/03/2009",nationality:"Nigeria",currentClub:"Eagles Elite FC",position:"RW",foot:"Right",height:"",weight:"",international:"",transferFee:"TBC",contractExpiry:"",description:"Liberty is an exciting young winger who currently plays for Eagles Elite FC in Nigeria. Eagles Elite are a new academy led by the coaches and scouts who discovered and developed Daniel Daga and Clinton Jephta. Liberty is regarded as their latest top talent. He displays great technical ability and the skill and pace to beat players. He can build play and participate in one and two touch passing sequences to progress the game. He has an eye for a pass and is composed in front of goal.",notes:"Widely regarded as the next Clinton Jephta. Eagles Elite academy — same coaches who developed Daniel Daga and Clinton Jephta.",technical:{score:7,notes:"Technical, skill and pace"},tactical:{score:6,notes:"Eye for pass, composed"},physical:{score:7,notes:"Pace and skill"},mental:{score:6,notes:"Academy pedigree — Daga and Jephta"},leagueQuality:{level:"Low",notes:"Eagles Elite FC, Nigeria"},recommendation:{verdict:"MONITOR",priority:"MEDIUM",suitableMarket:"Europe development pathway",rationale:"Same academy as Daga and Jephta. Monitor through that connection."},videoUrl:"https://vimeo.com/1199836897/4531a52083",transfermarktUrl:"",fbrefUrl:"",status:"Monitoring",source:"1863 Player",addedBy:"AV",dateAdded:"17/06/2026"},
  {id:"csv_72",name:"Bisenda Eldad Dimbedi",dob:"23/10/2008",nationality:"DR Congo",currentClub:"Alanyaspor U19",position:"RW",foot:"Right",height:"",weight:"",international:"",transferFee:"TBC",contractExpiry:"",description:"Jordan (as he is known) is a young, quick and explosive forward capable of playing anywhere across the forward line. He is impressing for Turkish Super Lig side Alanyaspor's U19s. He has a direct style that can be harnessed out wide or through the middle. He has the acceleration, skill and technical ability to go past defenders to create opportunities for himself and team mates. He has a habit of finding space in the area, can press from the front and is capable of scoring all types of goals.",notes:"Goes by the name Jordan. Father moved to Turkey for work. DR Congo nationality. Turkish Super League U19 environment.",technical:{score:7,notes:"Direct, technical, explosive"},tactical:{score:6,notes:"Can play anywhere across forward line"},physical:{score:8,notes:"Electric pace and acceleration"},mental:{score:6,notes:"17 years old — raw"},leagueQuality:{level:"Medium",notes:"Alanyaspor U19 — Turkish Super League environment"},recommendation:{verdict:"MONITOR",priority:"MEDIUM",suitableMarket:"Europe — Turkish connection",rationale:"Young DR Congo prospect in Turkish top flight environment. Raw but exciting."},videoUrl:"https://vimeo.com/1199827162/163f5cc8ab",transfermarktUrl:"",fbrefUrl:"",status:"Monitoring",source:"1863 Player",addedBy:"AV",dateAdded:"17/06/2026"},
  {id:"csv_73",name:"Daniele Luncasu",dob:"14/02/2008",nationality:"Romania",currentClub:"FC Bacau",position:"LW",foot:"Right",height:"",weight:"",international:"U15s, U16s, U17s, U18s",transferFee:"TBC",contractExpiry:"",description:"Luncasu is a young winger who currently plays for FC Bacau in the Romanian second tier. He made the first team squad last season after impressing in the youth sides and has gone on to score 2 and assist 2 in 24 appearances this season (14 starts). He likes to drift in off the left flank to create options through the middle. He offers good pace and technical ability and can both score and create. He is a Romanian youth international.",notes:"Romanian youth international at every age group from U15 to U18. Regular starter in Romanian second tier at 18.",technical:{score:7,notes:"Good technical ability, drifts inside"},tactical:{score:6,notes:"Intelligent movement, creates through middle"},physical:{score:6,notes:"Pace and technical ability"},mental:{score:6,notes:"Romanian youth international every age group"},leagueQuality:{level:"Low-Medium",notes:"Romanian second tier — promoted from third tier"},recommendation:{verdict:"MONITOR",priority:"MEDIUM",suitableMarket:"Eastern Europe / Scandinavia",rationale:"Romanian youth international. Regular second tier starter at 18. Good value."},videoUrl:"https://vimeo.com/1187868388/6e6dd5ca7b",transfermarktUrl:"https://www.transfermarkt.com/daniele-luncasu/profil/spieler/1107602",fbrefUrl:"",status:"Monitoring",source:"1863 Player",addedBy:"AV",dateAdded:"17/06/2026"},
  {id:"csv_74",name:"Alieu Conateh",dob:"28/12/2006",nationality:"Gambia",currentClub:"Grasshoppers (on loan at SKU Amstetten)",position:"RW",foot:"Right",height:"",weight:"",international:"U20s and Senior Squad",transferFee:"TBC",contractExpiry:"30/06/2028",description:"Conateh is an explosive winger making waves in the Austrian second tier on loan from Swiss side Grasshoppers. He previously spent months training at Bayern Munich's academy. He combines electric pace, direct dribbling and clinical finishing in transition. He has 5 goals and 7 assists in 23 starts (26 appearances) at a rate of 0.60 goals/assists per 90 minutes played. His hat-trick against Karpfenberg and overall output showcase natural instinct and composure beyond his years. He was recently called up to the Gambia senior national team and is playing a key role in Amstetten challenging for promotion.",notes:"Bayern Munich academy background. Senior Gambia call-up confirmed (McKinstry, March 2026 training camp ahead of vs Senegal). 5G 7A at 0.60 per 90 in Austrian second tier. Grasshoppers contract to 2028.",technical:{score:8,notes:"Electric pace, direct dribbling, clinical"},tactical:{score:7,notes:"Hat-trick scorer, creates and scores"},physical:{score:8,notes:"Explosive top-end pace"},mental:{score:7,notes:"Composure beyond his years"},leagueQuality:{level:"Medium",notes:"Austrian second tier on loan from Swiss Super League (Grasshoppers)"},recommendation:{verdict:"MONITOR",priority:"HIGH",suitableMarket:"Championship / Bundesliga / Swiss SL",rationale:"Bayern Munich background. Senior Gambia squad. 0.60 G+A per 90. Contract to 2028 at Grasshoppers — mandate opportunity."},videoUrl:"https://vimeo.com/1132955512/bdbfd29f3c",transfermarktUrl:"https://www.transfermarkt.com/alieu-conateh/leistungsdaten/spieler/1433170",fbrefUrl:"",status:"Monitoring",source:"1863 Player",addedBy:"AV",dateAdded:"17/06/2026"},
  {id:"csv_75",name:"Clinton Jephta",dob:"21/10/2006",nationality:"Nigeria",currentClub:"FC Inter Turku",position:"LW",foot:"Right",height:"1.75m",weight:"",international:"U20s (Nigeria)",transferFee:"TBC",contractExpiry:"30/06/2027",description:"Jephta is a tricky and skilful winger who currently plays for FC Inter Turku in Finland's Veikkausliiga. He has been the club's standout player as they sit top of the table after 11 games. He has 3 goals and 5 assists in 6 starts (9 appearances) at a rate of 1.30 goals/assists per 90 minutes. He displays intelligent movement and is comfortable receiving the ball to feet or running in behind to stretch defences. He has the quality to beat defenders in one-on-one situations and offers the ability to cut inside or go outside making him unpredictable. He was one of Nigeria's brightest sparks at the U20 AFCON starting every game as Nigeria finished third.",notes:"Eagles Elite academy graduate — same coaches as Daga. 1.30 G+A per 90 in Veikkausliiga. Inter Turku top of Finnish league. U20 AFCON starter. Contract June 2027 — affordable acquisition window.",technical:{score:8,notes:"Tricky, skilful, 1.30 G+A per 90"},tactical:{score:7,notes:"Intelligent movement, unpredictable"},physical:{score:7,notes:"Direct, can go inside or outside"},mental:{score:7,notes:"U20 AFCON starter, handles big occasions"},leagueQuality:{level:"Medium",notes:"Veikkausliiga Finland — Inter Turku top of table"},recommendation:{verdict:"MONITOR",priority:"HIGH",suitableMarket:"Championship / Eredivisie / Belgian Pro League",rationale:"Eagles Elite pedigree. 1.30 G+A per 90. U20 AFCON. Contract June 2027."},videoUrl:"https://vimeo.com/1195741278/01e087763d",transfermarktUrl:"https://www.transfermarkt.com/clinton-jephta/profil/spieler/1190286",fbrefUrl:"",status:"Monitoring",source:"1863 Player",addedBy:"AV",dateAdded:"17/06/2026"}
];

const SEED_CONSULTANTS = [
  {id:"c1",name:"Drin",market:"Finland",role:"Placing",email:"",phone:"",notes:"",dateAdded:"01/07/2025"},
  {id:"c2",name:"Zikas",market:"Czech & Slovakia",role:"Placing & Sourcing",email:"",phone:"",notes:"Worked with Lingr on Feyenoord move. Strong Czech/Slovak network.",dateAdded:"01/07/2025"},
  {id:"c3",name:"Cristiano & Luca",market:"Italy",role:"Placing & Sourcing",email:"",phone:"",notes:"",dateAdded:"01/07/2025"},
  {id:"c4",name:"Bruno & Mauricio",market:"Brazil",role:"Placing & Sourcing",email:"",phone:"",notes:"",dateAdded:"01/07/2025"},
  {id:"c5",name:"Tony",market:"Australia",role:"Sourcing",email:"",phone:"",notes:"Tony Rallis – Clayton Taylor source.",dateAdded:"01/07/2025"},
  {id:"c6",name:"Mislav",market:"Croatia",role:"Placing & Sourcing",email:"",phone:"",notes:"",dateAdded:"01/07/2025"},
  {id:"c7",name:"Efe",market:"Nigeria",role:"Sourcing",email:"",phone:"",notes:"Key Nigeria source for Lagos events.",dateAdded:"01/07/2025"},
  {id:"c8",name:"Mikkel",market:"Denmark",role:"Placing",email:"",phone:"",notes:"",dateAdded:"01/07/2025"},
  {id:"c9",name:"Yoshini",market:"Japan",role:"Placing & Sourcing",email:"",phone:"",notes:"",dateAdded:"01/07/2025"},
  {id:"c10",name:"David Riveira",market:"Spain",role:"Placing",email:"",phone:"",notes:"",dateAdded:"01/07/2025"},
];

const SEED_CLUBS = [
  {id:"db_10",name:"Arsenal",league:"Premier League",country:"England",tier:"Elite",positionsRequired:"No 9 /  / CM /  / GK (no 2)",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Emails with Fran Cagigao on 15/06/19  Emails with Vinai V and Edu 14.01.21; 10.04.21  Calls with Jason Ayto, April 21, Aug 21, Dec 2021, 5 Jan 2022  Meet Jason in Spring, St Albans  To propose: | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_11",name:"Aston Villa",league:"Premier League",country:"England",tier:"Elite",positionsRequired:"Centre Back (loan) /  / Centre Midfield (no 6)",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Spoke to Johan 13 May 2021, Dec 21  *arrange dinner with Ben / Johan  Catch up with Ben  To propose:  Adamu for summer | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_12",name:"Brentford",league:"Premier League",country:"England",tier:"Elite",positionsRequired:"Winger /  / Goalkeeper (no 2) /  / No 10",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Emails with Phil Giles 10.01.22, 11.01.22  Phil said he will review the players  Meet Phil  To propose:  Pape Gueye Martin Fraisl | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_13",name:"Brighton & Hove Albion",league:"Premier League",country:"England",tier:"Elite",positionsRequired:"No 9 (summer) /  / LB (back up)",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Met Paul Winstanley – 9 April 2019  Email to PW 18/06/19  Email to PW 15/11/19  Texts with PW – 31/12/19  Call with PW in Feb 21  Emails, texts 11/04/21  Call with Paul 18/05/21  To propose:  Summer – discuss Sasa K, Adamu, maybe Kabak | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_14",name:"Burnley",league:"Premier League",country:"England",tier:"Elite",positionsRequired:"Centre Back (summer) /  / Left Back (summer) /  / No 9 /  / Back up GK? /  / CM (no 8)",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Met with Ian and Martin Hodge on 17/10  Arranged trip to Udinese with Mike Rigg in February 2019  Met with Mike Rigg 22/10/19  Spoke to Ian B, Dec 21. Emails, Msgs 17.01.22  To propose: | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_15",name:"Chelsea",league:"Premier League",country:"England",tier:"Elite",positionsRequired:"Centre back (summer) /  / No 9 (back up, summer?) /  / LWB",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"had lunch with Scott 05/11/18  spoke to Scott 29/03/19   met Scott on 5/04/19  Spoke to Scott on 04/21; 06/21; 08/21; 11/21   Send list of players to Scott to follow*  Meet Scott after window – he said to arrange*  To propose: | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_16",name:"Crystal Palace",league:"Premier League",country:"England",tier:"Elite",positionsRequired:"CM",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Spoke to Barry Simmonds 06/12/18, 23/12/20, 31/12/20  Emails with D Freedman end of Nov 19 re Samatta, met Dougie May and Aug 21  Czech R, Turkey and Romania are ‘tier 4’ leagues  Arrange meeting with DF  To propose:  Fatouh Marko Lazetic | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_17",name:"Everton",league:"Premier League",country:"England",tier:"Elite",positionsRequired:"Centre Midfield /  / No 9? /  / Centre Back?",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Arrange to meet Frank?  To propose: | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_18",name:"Leeds United",league:"Premier League",country:"England",tier:"Elite",positionsRequired:"Centre Midfield (summer) /  / No 9 (summer?)",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"**Speak to Terry Potter/Graham Bean/Debra Ware/Victor Orta  Texts with Victor on 13.01.22  Arrange meeting with Victor  To propose: | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_19",name:"Leicester City",league:"Premier League",country:"England",tier:"Elite",positionsRequired:"Centre back (loan) /  / Striker (Vardy replacement long term) /  / Left back? /  / U23 players",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Propose young players for academy 15-21  Guy is in charge of loans for U23 and still working on U23 recruitment  Spoke to Guy – Jan 22 re Wanya  Stay in touch with Tom Thacker. Meet Lee Congerton.  Catch up with Guy   To propose (summer):  Sasa Kalaj | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_20",name:"Liverpool",league:"Premier League",country:"England",tier:"Elite",positionsRequired:"Winger/forward /  / No 9 (U19) /  / Centre midfielder",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"To do:  Fatawu – must sign first | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_21",name:"Manchester City",league:"Premier League",country:"England",tier:"Elite",positionsRequired:"No 9 (summer) /  / U23 players",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"*catch up with Gary W.  Discuss NYC also.   To propose (autumn):  Fatawu – must sign first | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_22",name:"Manchester United",league:"Premier League",country:"England",tier:"Elite",positionsRequired:"Right Back (experienced) /  / Centre midfielder",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"*catch up with Matt Judge, arrange meeting?  To propose:  Lazetic Fatawu – must sign | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_23",name:"Newcastle Utd",league:"Premier League",country:"England",tier:"Elite",positionsRequired:"No 9 x2 /  / No 8 – with legs and passing ability /  / Centre back x2 /  / LB /  / U17/ U19/ U23 Players",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Spoke to SN on 3 Jan 22, 26 Jan Spoke to NH on 23 Dec  To propose: | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_24",name:"Norwich City",league:"Premier League",country:"England",tier:"Elite",positionsRequired:"No 9 /  / Summer: /  / No 8/10 /  / RB (if sell Aarons) /  / CM",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Spoke with S Webber Sep 21.  Spoke with Lee Dunn Dec 21. Emails 11.01.22, spoke to Lee on 12.01.22  To propose: | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_25",name:"Southampton",league:"Premier League",country:"England",tier:"Elite",positionsRequired:"No 9 (summer) /  / No 2 GK",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Discussions with Martyn Glover late Dec 2019 re Lemina to Napoli  Spoke to Martyn G 13/11/20, 22/12/20, Jan 21  Meet Martyn in Preston  To propose:  Fatouh Fraisl Wagner Baba | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_26",name:"Tottenham",league:"Premier League",country:"England",tier:"Elite",positionsRequired:"Striker /  / RWB  /  / Centre back /  / No 8 (creative)",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Call Steve Hitchen on 26/11; text and emails to Steve on 08.1.21  Arrange meeting with Steve Hitchen   To propose (summer):  Kabak? | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_27",name:"Watford",league:"Premier League",country:"England",tier:"Elite",positionsRequired:"Left back /  / No 9 /  / Centre back",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Cherno knows Gino well. Sent email with players…  To propose:  Fatouh Wagner | Agent: CS",dateAdded:"01/02/2026"},
  {id:"db_28",name:"West Ham Utd",league:"Premier League",country:"England",tier:"Elite",positionsRequired:"No 9 /  / Left back /  / Central midfielder – no 8 /  / Centre Back (left) /  / GK (possibly summer)",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Met Jordan Miles 18/06/18  Met JM and Mario Husillos 26/02/19  Met Mario on 06/06/19  Emails with Moyes Dec 21  Met JM Nov 21  To propose: | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_29",name:"Wolves",league:"Premier League",country:"England",tier:"Elite",positionsRequired:"No 9 (back up) /  / Centre back  /  / RWB (reserve, younger one)",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Met with JM 15/10/18  Spoke to JM May 2019  Emailed JM 18/06/19  To propose (summer): | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_30",name:"Barnsley",league:"Championship",country:"England",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"To propose: | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_31",name:"Birmingham City",league:"Championship",country:"England",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Emails to Craig Gardner – ask Dong for contact**  To propose: | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_32",name:"Blackburn Rovers",league:"Championship",country:"England",tier:"High",positionsRequired:"Centre Back /  / Centre Midfielder /  / No 9 /  / Goalkeeper",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"John Park is new head of recruitment.  Working with Mark Venus. If no response from Park, contact Venus*  Emailed John Park 24.01.22, 26.01.22. | Agent: AV / JS",dateAdded:"01/02/2026"},
  {id:"db_33",name:"Bournemouth",league:"Championship",country:"England",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Emails with Richard Hughes   CS has sent the players to Simon Francis  To propose: | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_34",name:"Cardiff City",league:"Championship",country:"England",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"*contact Mehmet Dalman – arrange meeting  To propose: | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_35",name:"Coventry City",league:"Championship",country:"England",tier:"High",positionsRequired:"LB (summer)",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"U23 players – can come in for pre-season.    * Chris wants to work on Czech and Slovak players with us   Arrange catch up meeting with Chris (Bridgnorth)  To propose:  Fatouh Gueye Fraisl | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_36",name:"Derby County",league:"Championship",country:"England",tier:"High",positionsRequired:"GK",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Cherno knows Wayne Rooney | Agent: CS",dateAdded:"01/02/2026"},
  {id:"db_37",name:"Fulham",league:"Championship",country:"England",tier:"High",positionsRequired:"All positions considered (summer) /  / No signings in January",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"* met with Brian 15/11/18.    *spoke to Brian Dec 21, Jan 22  To propose:  Adamu – summer Baba | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_38",name:"Huddersfield",league:"Championship",country:"England",tier:"High",positionsRequired:"All positions considered",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"*emails with Josh Marsh 20/01/19; 03/06/19; 04/12/19  *meet Josh Marsh  To propose:  Pape Gueye, Fatouh, Wagner | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_39",name:"Hull City",league:"Championship",country:"England",tier:"High",positionsRequired:"RCB (can cover RB) /  / Attacking Midfielder/Winger (Left)",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"*Met up with Lee D on 19/10/17, spoke to Lee 04/12/19  Emails with Lee – Jan 22  To propose: | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_40",name:"Luton Town",league:"Championship",country:"England",tier:"High",positionsRequired:"GK (summer)",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Spoke to Kevin Reeves 18/11/19, 04/12/19.  Arrange to meet when next in NW.  Kevin has left  Emails with Phil Chapple 26.01.22, 27.01.22  To propose:  Fatouh, Wagner? | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_41",name:"Middlesbrough FC",league:"Championship",country:"England",tier:"High",positionsRequired:"LCB /  / No 9 (summer) /  / CM /  / GK",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Ongoing discussions with Aaron / meet Kieran Scott  To propose: | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_42",name:"Millwall",league:"Championship",country:"England",tier:"High",positionsRequired:"No 9 /  / CM - possibly",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Took Harvey to Eupen v Kortrijk in Nov 21.  Keep Harvey updated | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_43",name:"Reading",league:"Championship",country:"England",tier:"High",positionsRequired:"No 9",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Stay in touch with Seb and Jason  To propose:  players for summer | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_44",name:"QPR",league:"Championship",country:"England",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Emails with Les Ferdinand 24.01.22  Send profiles to Les post window and arrange to meet up  To propose:  Fraisl? | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_45",name:"Sheffield United",league:"Championship",country:"England",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Zoom call with Paul Mitchell and Carl Shieber – July 2021  Emailed list   To propose:  Fraisl? Fatouh | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_46",name:"Sheffield Wednesday",league:"Championship",country:"England",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"David Downes (ex Villa) – emails with David on 04/08/20  To propose: | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_47",name:"Stoke City",league:"Championship",country:"England",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Pete Wilding – Academy  Emails with Alex Aldridge – 24.01.22  Arrange to meet  To propose: | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_48",name:"Swansea City",league:"Championship",country:"England",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Emails with Mark Allen 23.01.22  Meet Mark | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_49",name:"West Brom",league:"Championship",country:"England",tier:"High",positionsRequired:"No 9?",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"*arrange meeting with Ian Pearce  To propose:  Baba Fraisl | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_50",name:"Bristol Rovers",league:"League One",country:"England",tier:"Mid",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"| Agent: JS",dateAdded:"01/02/2026"},
  {id:"db_51",name:"Ipswich Town",league:"League One",country:"England",tier:"Mid",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"| Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_52",name:"Fleetwood Town",league:"League One",country:"England",tier:"Mid",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"| Agent: AV/JS",dateAdded:"01/02/2026"},
  {id:"db_53",name:"MK Dons",league:"League One",country:"England",tier:"Mid",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"| Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_54",name:"Oldham Athletic",league:"League One",country:"England",tier:"Mid",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"| Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_55",name:"Oxford United",league:"League One",country:"England",tier:"Mid",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"| Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_56",name:"Scunthorpe",league:"League One",country:"England",tier:"Mid",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"| Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_57",name:"Southend",league:"League One",country:"England",tier:"Mid",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"DM has been sacked | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_58",name:"Wigan Athletic",league:"League One",country:"England",tier:"Mid",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"*speak to Gregor Rioch | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_59",name:"Grimsby",league:"League Two",country:"England",tier:"Mid",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"| Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_60",name:"Solihull Moors",league:"National League",country:"England",tier:"Mid",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Meet Craig Cope | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_61",name:"Celtic",league:"Premiership",country:"Scotland",tier:"Mid",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Sent email to Peter Lawwell 09/07/19  Spoke to Nick H 0/08/19; 29/11/19   To propose: | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_62",name:"Rangers",league:"Premiership",country:"Scotland",tier:"Mid",positionsRequired:"Wide Player with pace /  / No 9",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Spoke to Ross on 5/12/19. Emails with Ross Nov 21  Arrange to meet Ross   To propose:  Gueye – push for summer  Tetteh",dateAdded:"01/02/2026"},
  {id:"db_63",name:"Hearts",league:"Premiership",country:"Scotland",tier:"Mid",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Call Robbie  John M retired  To propose: | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_64",name:"Hibernian",league:"Premiership",country:"Scotland",tier:"Mid",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"To propose: | Agent: JS/AV",dateAdded:"01/02/2026"},
  {id:"db_65",name:"Livingston",league:"Premiership",country:"Scotland",tier:"Mid",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Catch up with Davie | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_66",name:"Motherwell",league:"Premiership",country:"Scotland",tier:"Mid",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"| Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_67",name:"Ross County",league:"Premiership",country:"Scotland",tier:"Mid",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"| Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_68",name:"St Mirren",league:"Premiership",country:"Scotland",tier:"Mid",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"| Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_69",name:"Dundee United",league:"Championship",country:"Scotland",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"| Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_70",name:"Falkirk",league:"Championship",country:"Scotland",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"| Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_71",name:"Inverness CT",league:"Championship",country:"Scotland",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"John Robertson | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_72",name:"Brisbane Roar",league:"Championship",country:"Scotland",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"| Agent: JS",dateAdded:"01/02/2026"},
  {id:"db_73",name:"Dinamo Zagreb",league:"Championship",country:"Scotland",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Via Mislav | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_74",name:"Rijeka",league:"Championship",country:"Scotland",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Via Mislav | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_75",name:"Apoel",league:"Championship",country:"Scotland",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"| Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_76",name:"Pafos FC",league:"Championship",country:"Scotland",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Via Roman Dubov and Ron | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_77",name:"Copenhagen",league:"Championship",country:"Scotland",tier:"High",positionsRequired:"No 9 /  / Winger /  / Young UK based players",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Stay in touch with Peter | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_78",name:"Midjtylland",league:"Championship",country:"Scotland",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"| Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_79",name:"Montpellier",league:"Championship",country:"France",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Via Ludo | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_80",name:"Nantes",league:"Championship",country:"France",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Via Ludo | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_81",name:"Nice",league:"Championship",country:"France",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"",dateAdded:"01/02/2026"},
  {id:"db_82",name:"PSG",league:"Championship",country:"France",tier:"High",positionsRequired:"Goalkeeper",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Via Ludo | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_83",name:"Stade Rennes",league:"Championship",country:"France",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"| Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_84",name:"Augsburg",league:"Championship",country:"Germany",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"| Agent: SE",dateAdded:"01/02/2026"},
  {id:"db_85",name:"Bayern Munich",league:"Championship",country:"Germany",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"| Agent: SE",dateAdded:"01/02/2026"},
  {id:"db_86",name:"Bochum",league:"Championship",country:"Germany",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"| Agent: SE",dateAdded:"01/02/2026"},
  {id:"db_87",name:"Borussia Dortmund",league:"Championship",country:"Germany",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"| Agent: SE",dateAdded:"01/02/2026"},
  {id:"db_88",name:"Fortuna Dusseldorf",league:"Championship",country:"Germany",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"| Agent: SE",dateAdded:"01/02/2026"},
  {id:"db_89",name:"Hamburg",league:"Championship",country:"Germany",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"| Agent: SE",dateAdded:"01/02/2026"},
  {id:"db_90",name:"Hoffenheim",league:"Championship",country:"Germany",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"| Agent: SE",dateAdded:"01/02/2026"},
  {id:"db_91",name:"FC Koln",league:"Championship",country:"Germany",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"| Agent: SE",dateAdded:"01/02/2026"},
  {id:"db_92",name:"Mainz",league:"Championship",country:"Germany",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"| Agent: SE",dateAdded:"01/02/2026"},
  {id:"db_93",name:"FC Schalke",league:"Championship",country:"Germany",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"| Agent: SE",dateAdded:"01/02/2026"},
  {id:"db_94",name:"Stuttgart",league:"Championship",country:"Germany",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"| Agent: SE",dateAdded:"01/02/2026"},
  {id:"db_95",name:"St Pauli",league:"Championship",country:"Germany",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"| Agent: SE",dateAdded:"01/02/2026"},
  {id:"db_96",name:"Werder Bremen",league:"Championship",country:"Germany",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"| Agent: SE",dateAdded:"01/02/2026"},
  {id:"db_97",name:"Apollon Smyrnis",league:"Championship",country:"Germany",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Via Konstantinos | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_98",name:"Asteras Tripolis",league:"Championship",country:"Germany",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Check Soni",dateAdded:"01/02/2026"},
  {id:"db_99",name:"Atromitos",league:"Championship",country:"Germany",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Via Konstantinos | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_100",name:"Larissa",league:"Championship",country:"Germany",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Via Konstantinos | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_101",name:"LevadIakos",league:"Championship",country:"Germany",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Via Konstantinos | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_102",name:"Panathinaikos",league:"Championship",country:"Germany",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Via Konstantinos  To propose: | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_103",name:"PAOK",league:"Championship",country:"Germany",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Via Andreas | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_104",name:"Ashdod",league:"Championship",country:"Germany",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Via Nir/Ohad | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_105",name:"Hapoel Be’er Sheva",league:"Championship",country:"Germany",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Via Nir/Ohad | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_106",name:"Maccabi Haifa",league:"Championship",country:"Germany",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Via Nir/Ohad | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_107",name:"Maccabi Tel Aviv",league:"Championship",country:"Germany",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Via Nir/Ohad | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_108",name:"General",league:"Championship",country:"Germany",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Via Nir/Ohad | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_109",name:"AC Milan",league:"Championship",country:"Italy",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Via Sascha | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_110",name:"Inter Milan",league:"Championship",country:"Italy",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"| Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_111",name:"Ajax",league:"Championship",country:"Italy",tier:"High",positionsRequired:"Winger",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"| Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_112",name:"Feyenoord",league:"Championship",country:"Italy",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Can propose players in any position if they are interesting / Frank Arnesen via Cherno | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_113",name:"Vitesse",league:"Championship",country:"Italy",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"| Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_114",name:"Red Star Belgrade",league:"Championship",country:"Italy",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Via Marko  To propose: | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_115",name:"AS Trencin",league:"Championship",country:"Italy",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"| Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_116",name:"DAC",league:"Championship",country:"Italy",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"*Ron knows owners | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_117",name:"MSK Zilina",league:"Championship",country:"Italy",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Aremeyaw | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_118",name:"FK Senica",league:"Championship",country:"Italy",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"| Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_119",name:"Slovan Bratislava",league:"Championship",country:"Italy",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"| Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_120",name:"Atletico Madrid",league:"Championship",country:"Spain",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Via Ludo | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_121",name:"Girona",league:"Championship",country:"Spain",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Via Ludo | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_122",name:"RCD Mallorca",league:"Championship",country:"Spain",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Via Ludo | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_123",name:"FC Basel",league:"Championship",country:"Spain",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Via Sascha | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_124",name:"Lausanne",league:"Championship",country:"Spain",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"| Agent: JS",dateAdded:"01/02/2026"},
  {id:"db_125",name:"FC Luzern",league:"Championship",country:"Spain",tier:"High",positionsRequired:"No 9",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"| Agent: AV/SE",dateAdded:"01/02/2026"},
  {id:"db_126",name:"Shakhtar Donetsk",league:"Championship",country:"Spain",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"*arrange to meet Palkin | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_127",name:"Al Ain",league:"Championship",country:"Spain",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"To propose: | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_128",name:"Chicago Fire",league:"Championship",country:"Spain",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"*contact Nelson | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_129",name:"Colorado Rapids",league:"Championship",country:"Spain",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"**Catch up with Padraig and Mitch  To propose: | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_130",name:"DC United",league:"Championship",country:"Spain",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"To propose:  TETTEH – REVISIT Kilama | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_131",name:"New York City",league:"Championship",country:"Spain",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Call Gary W. | Agent: AV",dateAdded:"01/02/2026"},
  {id:"db_132",name:"New York Red Bulls",league:"Championship",country:"Spain",tier:"High",positionsRequired:"",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:"Kevin Thelwell – catch up | Agent: AV/JS",dateAdded:"01/02/2026"}
];

// 1863 brand logo – real vector paths extracted from official brand PDF
// LogoMark: just the "63" numeral mark SVG (used in nav at small sizes)
function LogoMark({size=40,dark=false}) {
  const id = `lg-${dark?"d":"c"}`;
  const fill = dark ? "#6d6e71" : `url(#${id})`;
  const w = size * (109.402/113.466);
  return (
    <svg width={w} height={size} viewBox="0 0 109.402 113.466" xmlns="http://www.w3.org/2000/svg" style={{flexShrink:0,display:"block"}}>
      {!dark && (
        <defs>
          <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="109.402" y2="113.466">
            <stop offset="0%" stopColor="#8BE4FA"/>
            <stop offset="45%" stopColor="#52AAEC"/>
            <stop offset="100%" stopColor="#1844B8"/>
          </linearGradient>
        </defs>
      )}
      <path d="M34.528 44.411C32.502 44.411 30.517 44.586 28.586 44.921L46.756 11.812L32.380 11.812L4.786 61.391C4.570 61.755 4.362 62.123 4.160 62.496C1.507 67.385 0.000 72.986 0.000 78.939C0.000 98.008 15.459 113.466 34.528 113.466C35.341 113.466 36.147 113.437 36.945 113.382L45.129 98.705C41.972 100.402 38.363 101.365 34.528 101.365C22.142 101.365 12.102 91.324 12.102 78.939C12.102 66.553 22.142 56.512 34.528 56.512C46.455 56.512 56.207 65.823 56.913 77.573L65.104 62.884C59.325 51.901 47.801 44.411 34.528 44.411" fill={fill}/>
      <path d="M104.845 49.398C101.816 43.907 97.681 39.408 92.552 36.023C89.890 34.283 86.870 32.826 83.577 31.692L82.505 31.323L96.819 0.000L55.559 0.000L49.886 11.758L77.129 11.758L69.451 29.226L68.015 32.416L62.897 43.966L64.332 43.526C66.778 42.776 69.252 42.395 71.684 42.395C75.088 42.395 78.376 43.063 81.457 44.380C84.531 45.699 87.231 47.504 89.480 49.746C91.735 51.996 93.545 54.686 94.860 57.743C96.180 60.813 96.850 64.091 96.850 67.486C96.850 70.990 96.179 74.296 94.858 77.314C93.540 80.323 91.728 82.961 89.472 85.154C87.217 87.344 84.521 89.118 81.457 90.426C78.378 91.741 75.089 92.408 71.684 92.408C66.745 92.408 62.126 91.072 57.952 88.436L57.934 88.424C55.625 86.885 53.593 84.992 51.895 82.798C50.191 80.603 48.881 78.150 48.002 75.511L47.992 75.478C47.790 74.805 47.644 74.081 47.560 73.326L47.492 72.717L34.265 72.717L34.400 73.516C35.279 78.715 37.135 83.531 39.915 87.828C43.046 92.670 47.079 96.649 51.905 99.656C57.951 103.386 64.606 105.278 71.684 105.278C76.919 105.278 81.885 104.290 86.445 102.343C91.012 100.394 95.044 97.689 98.429 94.304C101.811 90.922 104.516 86.890 106.467 82.321C108.414 77.759 109.402 72.793 109.402 67.560C109.402 60.996 107.869 54.885 104.845 49.398" fill={fill}/>
    </svg>
  );
}

// Full wordmark: EIGHTEEN + mark + sports & entertainment
function Logo1863({size=40,dark=false}) {
  const textColor = dark?"#231f20":"#e8edf0";
  const subColor  = dark?"#6d6e71":"#4a6475";
  const fontSize  = Math.max(8, Math.round(size * 0.145));
  const subSize   = Math.max(5, Math.round(size * 0.082));
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:0}}>
      <span style={{fontFamily:"'Barlow',sans-serif",fontWeight:900,fontSize:`${fontSize}px`,letterSpacing:"0.2em",color:textColor,textTransform:"uppercase",lineHeight:1.1,display:"block",textAlign:"center"}}>EIGHTEEN</span>
      <div style={{marginTop:`${Math.round(size*0.06)}px`}}>
        <LogoMark size={size} dark={dark}/>
      </div>
      <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:300,fontSize:`${subSize}px`,letterSpacing:"0.22em",color:subColor,textTransform:"uppercase",lineHeight:1,display:"block",textAlign:"center",marginTop:`${Math.round(size*0.05)}px`}}>sports &amp; entertainment</span>
    </div>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@900&family=Barlow+Condensed:wght@300&family=Inter:wght@300;400;500;600&family=Space+Mono:wght@400;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  ::placeholder{color:#2a3f52;}
  input,select,textarea{font-family:'DM Sans',sans-serif;}
  @keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}
  ::-webkit-scrollbar{width:3px;height:3px;}
  ::-webkit-scrollbar-track{background:#040c14;}
  ::-webkit-scrollbar-thumb{background:#143044;border-radius:2px;}
`;

// UI primitives
function Mono({children,color,size,style={}}) {
  return <span style={{fontFamily:"'Space Mono',monospace",fontSize:size||"10px",color:color||"#5a5a6a",letterSpacing:"0.07em",...style}}>{children}</span>;
}
function SL({children,style={}}) {
  return <div style={{fontFamily:"'Space Mono',monospace",fontSize:"9px",color:"#5a5a6a",letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:"10px",...style}}>{children}</div>;
}
function Badge({children,color,bg,style={}}) {
  return <span style={{display:"inline-flex",alignItems:"center",padding:"2px 8px",borderRadius:"2px",background:bg||T.dim,color:color||T.muted,fontSize:"9px",fontFamily:"'Space Mono',monospace",letterSpacing:"0.07em",textTransform:"uppercase",whiteSpace:"nowrap",...style}}>{children}</span>;
}
function VBadge({v}) {
  const m={SIGN:{c:T.green,bg:T.greenDim},MONITOR:{c:T.amber,bg:T.amberDim},PASS:{c:T.red,bg:T.redDim}};
  const s=m[v]||{c:T.muted,bg:T.dim};
  return <Badge color={s.c} bg={s.bg}>{v||"—"}</Badge>;
}
function PBadge({pos}) {
  return <Badge color="#fff" bg={POS_COLOR[pos]||"#333"}>{pos||"—"}</Badge>;
}
function TierBadge({tier}) {
  const m={Elite:{c:T.gold,bg:T.goldDim},High:{c:T.green,bg:T.greenDim},Mid:{c:T.amber,bg:T.amberDim},Development:{c:T.blue,bg:T.blueDim},Low:{c:T.muted,bg:T.dim}};
  const s=m[tier]||{c:T.muted,bg:T.dim};
  return <Badge color={s.c} bg={s.bg}>{tier}</Badge>;
}
function PropBadge({status}) {
  const m={Proposed:{c:T.blue,bg:T.blueDim},"Shown Interest":{c:T.amber,bg:T.amberDim},"Meeting Arranged":{c:T.gold,bg:T.goldDim},"Offer Made":{c:T.green,bg:T.greenDim},Rejected:{c:T.red,bg:T.redDim},Signed:{c:T.green,bg:T.greenBorder}};
  const s=m[status]||{c:T.muted,bg:T.dim};
  return <Badge color={s.c} bg={s.bg}>{status||"—"}</Badge>;
}
function Card({children,style={}}) {
  return <div style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:"4px",padding:"20px 22px",...style}}>{children}</div>;
}
function Btn({children,onClick,variant,small,disabled,fullWidth}) {
  const v={primary:{bg:T.gold,color:"#060608"},ghost:{bg:"transparent",color:T.muted},outline:{bg:"transparent",color:T.text,border:`1px solid ${T.border}`},danger:{bg:T.redDim,color:T.red}}[variant||"primary"]||{bg:T.gold,color:"#060608"};
  return <button onClick={onClick} disabled={disabled} style={{background:disabled?T.dim:v.bg,color:disabled?T.muted:v.color,border:v.border||"none",borderRadius:"3px",padding:small?"5px 12px":"9px 16px",fontSize:small?"9px":"10px",fontFamily:"'Space Mono',monospace",letterSpacing:"0.09em",textTransform:"uppercase",cursor:disabled?"not-allowed":"pointer",transition:"all 0.15s",whiteSpace:"nowrap",width:fullWidth?"100%":"auto"}}>{children}</button>;
}
function Inp({label,value,onChange,placeholder,type,multi,req,small}) {
  const s={width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:"3px",padding:small?"7px 10px":"9px 11px",color:T.text,fontSize:"13px",outline:"none",transition:"border-color 0.15s"};
  return (
    <div style={{marginBottom:"12px"}}>
      {label&&<label style={{display:"block",fontFamily:"'Space Mono',monospace",fontSize:"9px",color:T.muted,letterSpacing:"0.13em",textTransform:"uppercase",marginBottom:"5px"}}>{label}{req&&<span style={{color:T.gold}}> *</span>}</label>}
      {multi?<textarea value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={3} style={{...s,resize:"vertical"}} onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/>
      :<input type={type||"text"} value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={s} onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/>}
    </div>
  );
}
function Sel({label,value,onChange,options,small}) {
  return (
    <div style={{marginBottom:"12px"}}>
      {label&&<label style={{display:"block",fontFamily:"'Space Mono',monospace",fontSize:"9px",color:T.muted,letterSpacing:"0.13em",textTransform:"uppercase",marginBottom:"5px"}}>{label}</label>}
      <select value={value} onChange={e=>onChange(e.target.value)} style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:"3px",padding:small?"7px 10px":"9px 11px",color:T.text,fontSize:"13px",outline:"none"}}>
        {options.map(o=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
      </select>
    </div>
  );
}
function ScoreBar({score,label}) {
  return (
    <div style={{marginBottom:"7px"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"3px"}}>
        <Mono>{label}</Mono><Mono color={T.gold}>{score}/10</Mono>
      </div>
      <div style={{height:"2px",background:T.dim,borderRadius:"1px",overflow:"hidden"}}>
        <div style={{height:"100%",width:`${score*10}%`,background:score>=8?T.green:score>=6?T.amber:T.red,borderRadius:"1px"}}/>
      </div>
    </div>
  );
}

// Dashboard
function Dashboard({players,consultants,clubs,proposals,onNav}) {
  const signed=players.filter(p=>p.status==="Signed");
  const monitoring=players.filter(p=>p.recommendation?.verdict==="MONITOR");
  const hiPri=players.filter(p=>p.recommendation?.priority==="HIGH").sort((a,b)=>{
    const ord={Signed:0,Monitoring:1};
    return (ord[a.status]||1)-(ord[b.status]||1);
  });
  const recentProps=[...proposals].sort((a,b)=>b.date>a.date?1:-1).slice(0,6);
  const posCounts={};players.forEach(p=>{if(p.position)posCounts[p.position]=(posCounts[p.position]||0)+1;});

  // Contract expiry alerts - contracts expiring within 6 months
  const now=new Date();
  const sixMonths=new Date(now.getFullYear(),now.getMonth()+6,now.getDate());
  const expiring=players.filter(p=>{
    if(!p.contractExpiry||p.status!=="Signed") return false;
    const parts=p.contractExpiry.split("/");
    if(parts.length!==3) return false;
    const exp=new Date(parseInt(parts[2]),parseInt(parts[1])-1,parseInt(parts[0]));
    return exp<=sixMonths && exp>=now;
  }).sort((a,b)=>{
    const parse=s=>{const ps=s.split("/");return new Date(parseInt(ps[2]),parseInt(ps[1])-1,parseInt(ps[0]));};
    return parse(a.contractExpiry)-parse(b.contractExpiry);
  });

  // Nationality breakdown
  const natCounts={};players.forEach(p=>{if(p.nationality){const n=p.nationality.split("/")[0].trim();natCounts[n]=(natCounts[n]||0)+1;}});
  const topNats=Object.entries(natCounts).sort((a,b)=>b[1]-a[1]).slice(0,8);

  return (
    <div style={{animation:"fadeIn 0.3s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"22px"}}>
        <div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:"22px",color:T.text,marginBottom:"3px"}}>Dashboard</div>
          <Mono size="11px">{today()} · {players.length} players tracked</Mono>
        </div>
        <button onClick={()=>onNav("report")} style={{background:T.gold,border:"none",borderRadius:"4px",padding:"10px 18px",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:"10px",color:"#0a0a0a",letterSpacing:"0.08em",fontWeight:700,display:"flex",alignItems:"center",gap:"8px"}}>
          <span>⚡</span> WEEKLY REPORT
        </button>
      </div>

      {/* KPI Row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"2px",marginBottom:"2px"}}>
        {[
          ["Active Clients",signed.length,"signed players","Signed"],
          ["Monitoring",monitoring.length,"under review","MONITOR"],
          ["Clubs",clubs.length,"in network",null],
          ["Consultants",consultants.length,"in network",null]
        ].map(([l,v,s,highlight])=>(
          <div key={l} style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:"4px",padding:"16px 18px",cursor:highlight?"pointer":"default"}}
            onClick={highlight==="Signed"?()=>onNav("portfolio"):highlight==="MONITOR"?()=>onNav("players"):undefined}>
            <SL>{l}</SL>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:"28px",color:highlight==="Signed"?T.gold:T.text,lineHeight:1}}>{v}</div>
            <Mono size="10px" style={{marginTop:"3px"}}>{s}</Mono>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"2px",marginBottom:"2px"}}>
        {/* High Priority Players */}
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
            <SL style={{marginBottom:0}}>High Priority Players</SL>
            <button onClick={()=>onNav("players")} style={{background:"none",border:"none",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:"9px",color:T.muted,letterSpacing:"0.1em"}}>VIEW ALL →</button>
          </div>
          {hiPri.length===0&&<Mono size="11px">No high priority players yet</Mono>}
          {hiPri.slice(0,6).map(p=>(
            <div key={p.id} onClick={()=>onNav("player",p)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.dim}`,cursor:"pointer"}}>
              <div>
                <div style={{fontSize:"13px",color:T.text,fontWeight:500,marginBottom:"2px"}}>{p.name}</div>
                <div style={{display:"flex",gap:"6px",alignItems:"center"}}><PBadge pos={p.position}/><Mono size="10px" color={T.text}>{p.currentClub}</Mono></div>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"3px"}}>
                <div style={{fontSize:"9px",fontFamily:"'Space Mono',monospace",letterSpacing:"0.06em",padding:"2px 6px",borderRadius:"2px",background:p.status==="Signed"?T.gold+"22":"transparent",color:p.status==="Signed"?T.gold:T.muted,border:`1px solid ${p.status==="Signed"?T.gold:T.border}`}}>{p.status==="Signed"?"CLIENT":"MONITOR"}</div>
              </div>
            </div>
          ))}
        </Card>

        {/* Recent Club Activity */}
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
            <SL style={{marginBottom:0}}>Recent Club Activity</SL>
            <button onClick={()=>onNav("clubs")} style={{background:"none",border:"none",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:"9px",color:T.muted,letterSpacing:"0.1em"}}>VIEW ALL →</button>
          </div>
          {recentProps.length===0&&<Mono size="11px">No proposals logged yet. <button onClick={()=>onNav("players")} style={{background:"none",border:"none",color:T.gold,cursor:"pointer",fontFamily:"inherit",fontSize:"inherit"}}>Go to Players →</button></Mono>}
          {recentProps.map(pr=>{
            const player=players.find(p=>p.id===pr.playerId);
            const club=clubs.find(c=>c.id===pr.clubId);
            return (
              <div key={pr.id} style={{padding:"8px 0",borderBottom:`1px solid ${T.dim}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div>
                    <span style={{fontSize:"12px",color:T.text,fontWeight:500}}>{player?.name||"Unknown"}</span>
                    <span style={{fontSize:"11px",color:T.muted,margin:"0 6px"}}>→</span>
                    <span style={{fontSize:"12px",color:T.text}}>{club?.name||"Unknown"}</span>
                  </div>
                  <PropBadge status={pr.status}/>
                </div>
                <Mono size="9px" style={{marginTop:"2px"}}>{pr.date} · {pr.addedBy}</Mono>
              </div>
            );
          })}
        </Card>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"2px",marginBottom:"2px"}}>
        {/* Contract Expiry Alerts */}
        <Card>
          <SL>Contract Expiry Alerts</SL>
          {expiring.length===0&&<Mono size="11px" color={T.muted}>No client contracts expiring in next 6 months</Mono>}
          {expiring.map(p=>{
            const parts=p.contractExpiry.split("/");
            const exp=new Date(parseInt(parts[2]),parseInt(parts[1])-1,parseInt(parts[0]));
            const daysLeft=Math.ceil((exp-now)/(1000*60*60*24));
            const urgent=daysLeft<60;
            return (
              <div key={p.id} onClick={()=>onNav("player",p)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.dim}`,cursor:"pointer"}}>
                <div>
                  <div style={{fontSize:"12px",color:T.text,fontWeight:500}}>{p.name}</div>
                  <Mono size="10px">{p.currentClub}</Mono>
                </div>
                <div style={{textAlign:"right"}}>
                  <Mono size="10px" color={urgent?"#e06c75":T.gold}>{p.contractExpiry}</Mono>
                  <Mono size="9px" color={urgent?"#e06c75":T.muted}>{daysLeft}d</Mono>
                </div>
              </div>
            );
          })}
          {expiring.length===0&&<div style={{marginTop:"8px",padding:"12px",background:T.dim,borderRadius:"3px",textAlign:"center"}}>
            <Mono size="10px" color={T.muted}>✓ All client contracts stable</Mono>
          </div>}
        </Card>

        {/* Portfolio by Position */}
        <Card>
          <SL>Portfolio by Position</SL>
          <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
            {Object.entries(posCounts).sort((a,b)=>b[1]-a[1]).map(([pos,count])=>{
              const maxCount=Math.max(...Object.values(posCounts));
              return (
                <div key={pos} style={{display:"flex",alignItems:"center",gap:"8px"}}>
                  <PBadge pos={pos}/>
                  <div style={{flex:1,height:"4px",background:T.dim,borderRadius:"2px"}}>
                    <div style={{width:`${(count/maxCount)*100}%`,height:"100%",background:T.gold,borderRadius:"2px"}}/>
                  </div>
                  <Mono size="10px" color={T.text} style={{minWidth:"16px",textAlign:"right"}}>{count}</Mono>
                </div>
              );
            })}
            {players.length===0&&<Mono size="11px">No players yet</Mono>}
          </div>
        </Card>

        {/* Nationality Breakdown */}
        <Card>
          <SL>Nationality Breakdown</SL>
          <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
            {topNats.map(([nat,count])=>{
              const maxCount=topNats[0][1];
              return (
                <div key={nat} style={{display:"flex",alignItems:"center",gap:"8px"}}>
                  <Mono size="10px" color={T.text} style={{minWidth:"72px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{nat}</Mono>
                  <div style={{flex:1,height:"4px",background:T.dim,borderRadius:"2px"}}>
                    <div style={{width:`${(count/maxCount)*100}%`,height:"100%",background:"#61afef",borderRadius:"2px"}}/>
                  </div>
                  <Mono size="10px" color={T.muted} style={{minWidth:"16px",textAlign:"right"}}>{count}</Mono>
                </div>
              );
            })}
            {players.length===0&&<Mono size="11px">No players yet</Mono>}
          </div>
        </Card>
      </div>
    </div>
  );
}


// Club Recommender
function ClubRecommender({players}) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [markets, setMarkets] = useState(["Premier League","Championship","Scottish Premiership"]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [savedRecs, setSavedRecs] = useState([]);

  const ALL_MARKETS = [
    "Premier League","Championship","League One",
    "Bundesliga","2. Bundesliga",
    "Serie A","Serie B",
    "La Liga","La Liga 2",
    "Ligue 1","Ligue 2",
    "Eredivisie","Eerste Divisie",
    "Belgian Pro League",
    "Scottish Premiership",
    "Czech First League",
    "Swiss Super League",
    "Austrian Bundesliga",
    "Danish Superliga",
    "Norwegian Eliteserien",
    "Swedish Allsvenskan",
    "Portuguese Primeira Liga",
    "Greek Super League",
    "Turkish Super League",
    "Polish Ekstraklasa",
    "Croatian HNL",
    "MLS",
    "A-League (Australia)",
    "J1 League (Japan)",
    "Nigerian Premier League",
  ];

  const toggleMarket = (m) => setMarkets(prev => prev.includes(m) ? prev.filter(x=>x!==m) : [...prev,m]);
  const filtered = players.filter(p => p.name && (!search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.position||"").toLowerCase().includes(search.toLowerCase()) || (p.currentClub||"").toLowerCase().includes(search.toLowerCase())));

  const posColors = {GK:"#F5A623",LB:"#4A90D9",RB:"#4A90D9",CB:"#4A90D9",DM:"#7ED321",CM:"#7ED321",AM:"#7ED321",LW:"#BD10E0",RW:"#BD10E0",ST:"#e06c75"};

  const run = async () => {
    if (!selectedPlayer || markets.length === 0) return;
    setLoading(true); setResults(null); setError(null);
    const p = selectedPlayer;
    const sys = `You are a senior football recruitment consultant at 1863 Sports & Entertainment, a boutique football agency. Your job is to identify specific real clubs that should be approached to sign a player.

You may use web search to find current transfer news and squad needs to make recommendations more specific and actionable.

Return ONLY a valid JSON array — no markdown, no text outside the JSON.

Format:
[
  {
    "league": "League Name",
    "country": "Country",
    "clubs": [
      {
        "name": "Club Name",
        "rationale": "2-3 sentence specific rationale",
        "likelihood": "high|medium|low",
        "contactRoute": "e.g. Direct approach, via consultant, via transfer platform",
        "priority": 1
      }
    ]
  }
]`;

    const prompt = `Find specific club recommendations for the following player across these markets: ${markets.join(", ")}.

Name: ${p.name} | Position: ${p.position} | Club: ${p.currentClub} | Nationality: ${p.nationality}
Age/DOB: ${p.dob} | Height: ${p.height||"N/A"} | Foot: ${p.foot||"N/A"}
International: ${p.international||"N/A"} | Fee: ${p.transferFee||"TBC"} | Contract: ${p.contractExpiry||"Unknown"}
Profile: ${(p.description||"").slice(0,400)}
Suitable Market: ${p.recommendation?.suitableMarket||"Not specified"}

For each market, give 2-3 specific real clubs. Return only the JSON array.`;

    try {
      // Agentic tool-use loop — keeps going until stop_reason is "end_turn"
      const messages = [{role:"user", content:prompt}];
      let arr = null;
      let attempts = 0;
      const MAX_TURNS = 8;

      while (attempts < MAX_TURNS) {
        attempts++;
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {"Content-Type":"application/json"},
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 4000,
            system: sys,
            tools: [{type:"web_search_20250305",name:"web_search"}],
            messages
          })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);

        // Add assistant response to history
        messages.push({role:"assistant", content: data.content});

        if (data.stop_reason === "end_turn") {
          // Extract final text block
          const textBlocks = (data.content||[]).filter(b=>b.type==="text");
          if (!textBlocks.length) throw new Error("No text in final response");
          const raw = textBlocks[textBlocks.length-1].text.replace(/```json\s*/gi,"").replace(/```\s*/g,"").trim();
          try { arr = JSON.parse(raw); } catch {
            const m = raw.match(/\[\s*\{[\s\S]*\}\s*\]/);
            if (m) arr = JSON.parse(m[0]);
            else throw new Error("Could not parse recommendations — try selecting fewer markets");
          }
          break;
        }

        if (data.stop_reason === "tool_use") {
          // Feed tool results back so the loop can continue
          const toolUses = (data.content||[]).filter(b=>b.type==="tool_use");
          const toolResults = toolUses.map(tu=>({
            type:"tool_result", tool_use_id:tu.id, content:"Search completed."
          }));
          messages.push({role:"user", content:toolResults});
          continue;
        }

        // Unexpected stop reason
        throw new Error(`Unexpected stop: ${data.stop_reason}`);
      }

      if (!arr) throw new Error("No results returned after search — please try again");
      if (!Array.isArray(arr)) throw new Error("Invalid response format");
      setResults(arr);
    } catch(e) { setError(e.message); }
    setLoading(false);
  };

  const likelihoodColor = (l) => l==="high"?T.green:l==="medium"?T.amber:T.muted;
  const likelihoodBg = (l) => l==="high"?T.greenDim:l==="medium"?T.amberDim:T.dim;
  const likelihoodBorder = (l) => l==="high"?T.greenBorder:l==="medium"?T.amberBorder:T.border;

  const totalClubs = results ? results.reduce((s,r)=>s+(r.clubs?.length||0),0) : 0;

  return (
    <div style={{animation:"fadeIn 0.3s ease"}}>
      <div style={{marginBottom:"22px"}}>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:"22px",color:T.text,marginBottom:"3px"}}>Club Recommender</div>
        <Mono size="11px">AI-powered club identification across global football markets · powered by live web search</Mono>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"300px 1fr",gap:"12px",alignItems:"start"}}>

        {/* Left panel — player + market selection */}
        <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>

          {/* Player picker */}
          <Card>
            <SL>Select Player</SL>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search players…"
              style={{width:"100%",background:T.dim,border:`1px solid ${T.border}`,borderRadius:"3px",padding:"7px 10px",color:T.text,fontSize:"11px",outline:"none",marginBottom:"8px",boxSizing:"border-box"}}
              onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/>
            <div style={{maxHeight:"280px",overflowY:"auto",display:"flex",flexDirection:"column",gap:"3px"}}>
              {filtered.map(p => {
                const sel = selectedPlayer?.id === p.id;
                return (
                  <button key={p.id} onClick={()=>{setSelectedPlayer(p);setResults(null);setError(null);}}
                    style={{display:"flex",alignItems:"center",gap:"8px",padding:"7px 8px",borderRadius:"3px",border:`1px solid ${sel?T.gold:T.dim}`,background:sel?T.goldDim:T.dim,cursor:"pointer",textAlign:"left",transition:"all 0.1s"}}>
                    <span style={{width:"8px",height:"8px",borderRadius:"50%",background:posColors[p.position]||T.muted,flexShrink:0}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:"12px",color:sel?T.gold:T.text,fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.name}</div>
                      <Mono size="9px" style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.position} · {p.currentClub}</Mono>
                    </div>
                    {p.status==="Signed"&&<div style={{fontSize:"8px",fontFamily:"'Space Mono',monospace",color:T.gold,flexShrink:0}}>CLIENT</div>}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Selected player summary */}
          {selectedPlayer && (
            <Card style={{background:T.goldDim,border:`1px solid ${T.gold}44`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"6px"}}>
                <div style={{fontFamily:"'DM Serif Display',serif",fontSize:"15px",color:T.text}}>{selectedPlayer.name}</div>
                <PBadge pos={selectedPlayer.position}/>
              </div>
              <Mono size="10px" color={T.text} style={{marginBottom:"3px"}}>{selectedPlayer.currentClub}</Mono>
              <Mono size="10px">{selectedPlayer.nationality} · {selectedPlayer.dob}</Mono>
              {selectedPlayer.recommendation?.suitableMarket && (
                <div style={{marginTop:"8px",padding:"6px 8px",background:T.dim,borderRadius:"3px"}}>
                  <Mono size="9px" color={T.muted}>Suggested market</Mono>
                  <Mono size="10px" color={T.text}>{selectedPlayer.recommendation.suitableMarket}</Mono>
                </div>
              )}
            </Card>
          )}

          {/* Markets */}
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
              <SL style={{marginBottom:0}}>Markets</SL>
              <div style={{display:"flex",gap:"4px"}}>
                <button onClick={()=>setMarkets(ALL_MARKETS)} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:"8px",fontFamily:"'Space Mono',monospace",letterSpacing:"0.07em"}}>ALL</button>
                <button onClick={()=>setMarkets([])} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:"8px",fontFamily:"'Space Mono',monospace",letterSpacing:"0.07em"}}>NONE</button>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"3px",maxHeight:"260px",overflowY:"auto"}}>
              {ALL_MARKETS.map(m => {
                const sel = markets.includes(m);
                return (
                  <button key={m} onClick={()=>toggleMarket(m)}
                    style={{display:"flex",alignItems:"center",gap:"7px",padding:"5px 7px",borderRadius:"3px",border:`1px solid ${sel?T.gold+"55":T.dim}`,background:sel?T.goldDim:"transparent",cursor:"pointer",textAlign:"left"}}>
                    <div style={{width:"12px",height:"12px",borderRadius:"2px",border:`1px solid ${sel?T.gold:T.border}`,background:sel?T.gold:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {sel&&<span style={{color:"#0a0a0a",fontSize:"8px",fontWeight:"bold",lineHeight:1}}>✓</span>}
                    </div>
                    <span style={{fontSize:"10px",fontFamily:"'Space Mono',monospace",color:sel?T.gold:T.muted,letterSpacing:"0.04em"}}>{m}</span>
                  </button>
                );
              })}
            </div>
            <Mono size="9px" style={{marginTop:"8px"}}>{markets.length} markets selected</Mono>
          </Card>

          <button onClick={run} disabled={!selectedPlayer||markets.length===0||loading}
            style={{background:(!selectedPlayer||markets.length===0||loading)?T.dim:T.gold,border:`1px solid ${(!selectedPlayer||markets.length===0||loading)?T.border:T.gold}`,borderRadius:"4px",padding:"12px",cursor:(!selectedPlayer||markets.length===0||loading)?"not-allowed":"pointer",fontFamily:"'Space Mono',monospace",fontSize:"11px",color:(!selectedPlayer||markets.length===0||loading)?T.muted:"#0a0a0a",letterSpacing:"0.08em",fontWeight:700,transition:"all 0.15s"}}>
            {loading ? "⟳ SEARCHING MARKETS…" : "⚡ FIND CLUBS"}
          </button>
          {loading&&<Mono size="10px" style={{textAlign:"center"}}>Searching {markets.length} markets with live web data…</Mono>}
        </div>

        {/* Right panel — results */}
        <div>
          {!results && !error && !loading && (
            <Card style={{textAlign:"center",padding:"48px 32px"}}>
              <div style={{fontSize:"32px",marginBottom:"12px",opacity:0.3}}>⬡</div>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:"16px",color:T.text,marginBottom:"6px"}}>Select a player and markets</div>
              <Mono size="10px">The AI will search live transfer news and club profiles to identify the best specific clubs to approach across your chosen markets</Mono>
            </Card>
          )}

          {error && (
            <Card style={{border:`1px solid ${T.redBorder}`,background:T.redDim}}>
              <Mono size="11px" color={T.red}>Error: {error}</Mono>
            </Card>
          )}

          {results && (
            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              {/* Summary bar */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"4px"}}>
                <div>
                  <div style={{fontFamily:"'DM Serif Display',serif",fontSize:"16px",color:T.text}}>Recommendations for {selectedPlayer?.name}</div>
                  <Mono size="10px">{totalClubs} clubs across {results.length} markets</Mono>
                </div>
              </div>

              {results.map((league, li) => (
                <Card key={li}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
                    <div>
                      <div style={{fontSize:"14px",fontWeight:600,color:T.text}}>{league.league}</div>
                      <Mono size="10px">{league.country}</Mono>
                    </div>
                    <Mono size="9px">{league.clubs?.length||0} clubs</Mono>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                    {(league.clubs||[]).sort((a,b)=>a.priority-b.priority).map((club, ci) => (
                      <div key={ci} style={{padding:"12px",background:T.dim,borderRadius:"4px",border:`1px solid ${T.border}`}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"6px"}}>
                          <div style={{fontSize:"13px",fontWeight:600,color:T.text}}>{club.name}</div>
                          <div style={{display:"flex",gap:"6px",alignItems:"center",flexShrink:0,marginLeft:"8px"}}>
                            <div style={{padding:"2px 8px",borderRadius:"2px",background:likelihoodBg(club.likelihood),border:`1px solid ${likelihoodBorder(club.likelihood)}`,fontFamily:"'Space Mono',monospace",fontSize:"8px",color:likelihoodColor(club.likelihood),letterSpacing:"0.08em",textTransform:"uppercase"}}>{club.likelihood||"medium"}</div>
                          </div>
                        </div>
                        <p style={{fontSize:"12px",color:T.muted,margin:"0 0 6px",lineHeight:1.5}}>{club.rationale}</p>
                        {club.contactRoute && (
                          <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                            <Mono size="9px" color={T.muted}>Route:</Mono>
                            <Mono size="9px" color={T.text}>{club.contactRoute}</Mono>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// Archive View
function ArchiveView({players, onUnarchive, onNav}) {
  const archived = players.filter(p => p.archived);
  const posColors = {GK:"#F5A623",LB:"#4A90D9",RB:"#4A90D9",CB:"#4A90D9",DM:"#7ED321",CM:"#7ED321",AM:"#7ED321",LW:"#BD10E0",RW:"#BD10E0",ST:"#e06c75"};
  return (
    <div style={{animation:"fadeIn 0.3s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"22px"}}>
        <div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:"22px",color:T.text,marginBottom:"3px"}}>Archive</div>
          <Mono size="11px">{archived.length} player{archived.length!==1?"s":""} archived · not actively being worked on</Mono>
        </div>
      </div>
      {archived.length===0?(
        <Card style={{textAlign:"center",padding:"48px 32px"}}>
          <div style={{fontSize:"28px",marginBottom:"12px",opacity:0.2}}>◻</div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:"16px",color:T.text,marginBottom:"6px"}}>No archived players</div>
          <Mono size="10px">Tick the archive box on any player profile to move them here</Mono>
        </Card>
      ):(
        <Card style={{padding:0,overflow:"hidden"}}>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:"600px"}}>
              <thead>
                <tr style={{borderBottom:`1px solid ${T.border}`}}>
                  {["Player","Pos","Club","Nationality","Archived",""].map(h=>(
                    <th key={h} style={{padding:"9px 12px",textAlign:"left",fontFamily:"'Space Mono',monospace",fontSize:"8px",color:T.muted,letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:"normal"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {archived.map(p=>(
                  <tr key={p.id} style={{borderBottom:`1px solid ${T.dim}`,opacity:0.75}}>
                    <td style={{padding:"10px 12px"}}>
                      <div style={{fontSize:"13px",color:T.text,fontWeight:500}}>{p.name}</div>
                      <Mono size="9px">{p.dob}</Mono>
                    </td>
                    <td style={{padding:"10px 12px"}}><PBadge pos={p.position}/></td>
                    <td style={{padding:"10px 12px",fontSize:"12px",color:T.muted}}>{p.currentClub}</td>
                    <td style={{padding:"10px 12px"}}><Mono size="10px" color={T.muted}>{p.nationality}</Mono></td>
                    <td style={{padding:"10px 12px"}}><Mono size="10px" color={T.muted}>{p.archivedDate||"—"}</Mono></td>
                    <td style={{padding:"10px 12px"}}>
                      <button onClick={()=>onUnarchive(p.id)} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:"3px",padding:"4px 10px",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:"8px",color:T.muted,letterSpacing:"0.07em",whiteSpace:"nowrap"}}>↩ RESTORE</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      {archived.length>0&&(
        <div style={{marginTop:"12px",padding:"10px 14px",background:T.dim,borderRadius:"4px",display:"flex",alignItems:"center",gap:"8px"}}>
          <Mono size="10px" color={T.muted}>Archived players are hidden from all other views. Hit Restore to return a player to the active database.</Mono>
        </div>
      )}
    </div>
  );
}


// Export to Word Modal
function ExportModal({players, onClose}) {
  const posOrder=["GK","LB","RB","CB","DM","CM","AM","LW","RW","ST"];
  const sorted=[...players].sort((a,b)=>{
    const aS=a.status==="Signed"?0:1, bS=b.status==="Signed"?0:1;
    if(aS!==bS)return aS-bS;
    return (posOrder.indexOf(a.position)||99)-(posOrder.indexOf(b.position)||99);
  });
  const [selected,setSelected]=useState(players.map(p=>p.id));
  const [exporting,setExporting]=useState(false);
  const [done,setDone]=useState(false);

  const toggle=(id)=>setSelected(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  const toggleAll=()=>setSelected(prev=>prev.length===players.length?[]:players.map(p=>p.id));
  const toggleGroup=(grp)=>{
    const ids=grp.map(p=>p.id);
    const allIn=ids.every(id=>selected.includes(id));
    setSelected(prev=>allIn?prev.filter(id=>!ids.includes(id)):[...new Set([...prev,...ids])]);
  };

  const signed=sorted.filter(p=>p.status==="Signed");
  const monitoring=sorted.filter(p=>p.status!=="Signed");

  const posColors={GK:"#F5A623",LB:"#4A90D9",RB:"#4A90D9",CB:"#4A90D9",DM:"#7ED321",CM:"#7ED321",AM:"#7ED321",LW:"#BD10E0",RW:"#BD10E0",ST:"#e06c75"};

  const doExport=async()=>{
    const toExport=players.filter(p=>selected.includes(p.id));
    if(!toExport.length)return;
    setExporting(true);

    try {
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:4000,
          system:"You are a document generator for 1863 Sports & Entertainment, a boutique football agency. Generate a structured Word document content plan as JSON. Return ONLY valid JSON, no markdown.",
          messages:[{role:"user",content:`Generate a Word document export summary for these ${toExport.length} player profiles. Return JSON with structure: {"title": "1863 Player Export", "date": "today", "players": [{"name": "...", "position": "...", "club": "...", "nationality": "...", "dob": "...", "height": "...", "foot": "...", "international": "...", "fee": "...", "contract": "...", "description": "...", "notes": "...", "status": "..."}]}. Players: ${JSON.stringify(toExport.map(p=>({name:p.name,position:p.position,club:p.currentClub,nationality:p.nationality,dob:p.dob,height:p.height,foot:p.foot,international:p.international,fee:p.transferFee,contract:p.contractExpiry,description:p.description,notes:p.notes,status:p.status})))}`}]})});
      const data=await res.json();
    } catch(e) {}

    // Build the docx using docx-js via a data URL approach
    // We'll generate HTML that triggers a download
    buildAndDownloadDocx(toExport);
  };

  const buildAndDownloadDocx=(toExport)=>{
    // Generate RTF as a fallback that Word can open perfectly
    const posOrder2=["GK","LB","RB","CB","DM","CM","AM","LW","RW","ST"];
    const today=new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"long",year:"numeric"});

    let rtf = "{\\rtf1\\ansi\\deff0";
    rtf += "{\\fonttbl{\\f0 Arial;}{\\f1 Arial;}}";
    rtf += "{\\colortbl ;\\red204\\green0\\blue0;\\red26\\green26\\blue26;\\red136\\green136\\blue136;\\red68\\green68\\blue68;}";
    rtf += "\\paperw11906\\paperh16838\\margl1440\\margr1440\\margt1440\\margb1440";

    // Cover
    rtf += "\\pard\\qc\\sb2000{\\f0\\fs72\\b\\cf1 1863}\\par";
    rtf += "\\pard\\qc{\\f0\\fs22\\cf3 SPORTS & ENTERTAINMENT}\\par\\par";
    rtf += "{\\f0\\fs36\\cf4 Player Portfolio}\\par";
    rtf += "{\\f0\\fs20\\cf3 " + toExport.length + " Players  \\emdash  " + today + "}\\par\\par";
    rtf += "{\\f0\\fs18\\b\\cf1 STRICTLY PRIVATE & CONFIDENTIAL}\\par";
    rtf += "\\page";

    toExport.forEach(p=>{
      // Header band
      rtf += "\\pard\\sb200{\\f0\\fs48\\b\\cf2 " + esc(p.name||"") + "}\\par";
      rtf += "{\\f0\\fs20\\cf1\\b " + esc(p.position||"") + "}  {\\f0\\fs20\\cf3 " + esc(p.currentClub||"") + "  \\emdash  " + esc(p.nationality||"") + "}\\par";
      rtf += "\\sb120";

      // Stats row
      const stats=[["DOB",p.dob],["Height",p.height],["Foot",p.foot],["International",p.international],["Contract",p.contractExpiry],["Fee",p.transferFee]].filter(([,v])=>v);
      if(stats.length){
        rtf += "{\\f0\\fs16\\cf3 ";
        rtf += stats.map(([l,v])=>"\\b "+esc(l)+":\\b0  "+esc(v)).join("   |   ");
        rtf += "}\\par\\sb100";
      }

      if(p.description){
        rtf += "\\sb120{\\f0\\fs18\\b\\cf3 PROFILE}\\par";
        rtf += "{\\f0\\fs20\\cf4 " + esc(p.description) + "}\\par";
      }
      if(p.notes){
        rtf += "\\sb100{\\f0\\fs18\\b\\cf3 NOTES}\\par";
        rtf += "{\\f0\\fs20\\i\\cf4 " + esc(p.notes) + "}\\par";
      }
      if(p.transfermarktUrl){
        rtf += "\\sb100{\\f0\\fs18\\cf1 Transfermarkt: " + esc(p.transfermarktUrl) + "}\\par";
      }
      rtf += "\\page";
    });

    rtf += "}";

    const blob=new Blob([rtf],{type:"application/rtf"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url; a.download="1863_Player_Profiles.rtf"; a.click();
    URL.revokeObjectURL(url);
    setExporting(false); setDone(true);
  };

  const esc=(s)=>(s||"").replace(/\\/g,"\\\\").replace(/[{}]/g,"").replace(/\n/g," ").replace(/[^\x00-\x7F]/g,c=>"\\'"+c.charCodeAt(0).toString(16).padStart(2,"0"));

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:"6px",width:"100%",maxWidth:"680px",maxHeight:"85vh",overflow:"hidden",display:"flex",flexDirection:"column"}}>
        {/* Header */}
        <div style={{padding:"18px 20px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:"18px",color:T.text}}>Export Player Profiles</div>
            <Mono size="10px">{selected.length} of {players.length} players selected · exports as Word-compatible RTF</Mono>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:"20px",lineHeight:1}}>×</button>
        </div>

        {/* Player selection */}
        <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
          {/* Quick selects */}
          <div style={{display:"flex",gap:"6px",marginBottom:"14px",flexWrap:"wrap"}}>
            <button onClick={toggleAll} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:"3px",padding:"4px 10px",color:T.muted,fontSize:"9px",fontFamily:"'Space Mono',monospace",cursor:"pointer",letterSpacing:"0.07em"}}>
              {selected.length===players.length?"DESELECT ALL":"SELECT ALL"}
            </button>
            <button onClick={()=>toggleGroup(signed)} style={{background:"none",border:`1px solid ${T.gold}`,borderRadius:"3px",padding:"4px 10px",color:T.gold,fontSize:"9px",fontFamily:"'Space Mono',monospace",cursor:"pointer",letterSpacing:"0.07em"}}>
              CLIENTS ONLY
            </button>
            <button onClick={()=>toggleGroup(monitoring)} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:"3px",padding:"4px 10px",color:T.muted,fontSize:"9px",fontFamily:"'Space Mono',monospace",cursor:"pointer",letterSpacing:"0.07em"}}>
              MONITORING ONLY
            </button>
          </div>

          {/* Groups */}
          {[{label:"Active Clients",group:signed},{label:"Monitoring",group:monitoring}].map(({label:grpLabel,group})=>(
            group.length>0&&<div key={grpLabel} style={{marginBottom:"16px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px"}}>
                <Mono size="9px" color={T.muted} style={{letterSpacing:"0.12em"}}>{grpLabel.toUpperCase()}</Mono>
                <div style={{flex:1,height:"1px",background:T.border}}/>
                <button onClick={()=>toggleGroup(group)} style={{background:"none",border:"none",color:T.muted,fontSize:"9px",fontFamily:"'Space Mono',monospace",cursor:"pointer",letterSpacing:"0.07em"}}>{group.every(p=>selected.includes(p.id))?"DESELECT":"SELECT"}</button>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:"5px"}}>
                {group.map(p=>{
                  const sel=selected.includes(p.id);
                  return (
                    <button key={p.id} onClick={()=>toggle(p.id)} style={{display:"flex",alignItems:"center",gap:"5px",padding:"5px 9px",borderRadius:"3px",border:`1px solid ${sel?T.gold:T.border}`,background:sel?T.goldDim:T.dim,cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:"9px",color:sel?T.gold:T.muted,letterSpacing:"0.05em",transition:"all 0.1s"}}>
                      <span style={{width:"8px",height:"8px",borderRadius:"50%",background:posColors[p.position]||T.muted,display:"inline-block",flexShrink:0}}/>
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{padding:"14px 20px",borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <Mono size="10px" color={T.muted}>{done?"✓ Download started — open in Microsoft Word or Google Docs":exporting?"Generating...":selected.length+" profiles will be exported"}</Mono>
          <div style={{display:"flex",gap:"8px"}}>
            <button onClick={onClose} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:"3px",padding:"7px 14px",color:T.muted,fontSize:"10px",fontFamily:"'Space Mono',monospace",cursor:"pointer",letterSpacing:"0.07em"}}>CANCEL</button>
            <button onClick={doExport} disabled={!selected.length||exporting} style={{background:T.gold,border:"none",borderRadius:"3px",padding:"7px 18px",color:"#0a0a0a",fontSize:"10px",fontFamily:"'Space Mono',monospace",cursor:selected.length&&!exporting?"pointer":"not-allowed",letterSpacing:"0.07em",fontWeight:700,opacity:selected.length&&!exporting?1:0.5}}>
              {exporting?"GENERATING...":done?"⬇ EXPORT AGAIN":"⬇ EXPORT TO WORD"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Players List
const ALL_POS=["All","GK","LB","RB","CB","DM","CM","AM","LW","RW","ST"];
function PlayersList({players,onNav,onDelete,onArchive}) {
  const [q,setQ]=useState("");
  const [pos,setPos]=useState("All");
  const [verd,setVerd]=useState("All");
  const [stat,setStat]=useState("All");
  const [showExport,setShowExport]=useState(false);
  const active=players.filter(p=>!p.archived);
  const filtered=useMemo(()=>active.filter(p=>{
    if(q&&![p.name,p.currentClub,p.nationality].some(v=>v?.toLowerCase().includes(q.toLowerCase())))return false;
    if(pos!=="All"&&p.position!==pos)return false;
    if(verd!=="All"&&p.recommendation?.verdict!==verd)return false;
    if(stat!=="All"&&p.status!==stat)return false;
    return true;
  }),[active,q,pos,verd,stat]);
  return (
    <div style={{animation:"fadeIn 0.3s ease"}}>
      {showExport&&<ExportModal players={players} onClose={()=>setShowExport(false)}/>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"18px"}}>
        <div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:"22px",color:T.text,marginBottom:"3px"}}>Player Database</div>
          <Mono size="11px">{filtered.length} of {active.length} players · <button onClick={()=>onNav("archive")} style={{background:"none",border:"none",color:T.amber,cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:"10px",letterSpacing:"0.05em",padding:0}}>{players.filter(p=>p.archived).length} archived ↗</button></Mono>
        </div>
        <div style={{display:"flex",gap:"8px"}}>
          <Btn onClick={()=>setShowExport(true)} variant="outline" small>⬇ Export</Btn>
          <Btn onClick={()=>onNav("scout")} variant="outline" small>⚡ AI Scout</Btn>
          {canEdit&&<Btn onClick={()=>onNav("add-player")} small>+ Add Player</Btn>}
        </div>
      </div>
      <div style={{display:"flex",gap:"6px",marginBottom:"12px",flexWrap:"wrap"}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search name, club, nationality…"
          style={{flex:1,minWidth:"180px",background:T.panel,border:`1px solid ${T.border}`,borderRadius:"3px",padding:"7px 11px",color:T.text,fontSize:"12px",outline:"none"}}
          onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/>
        {[{v:pos,s:setPos,o:ALL_POS},{v:verd,s:setVerd,o:["All","SIGN","MONITOR","PASS"]},{v:stat,s:setStat,o:["All","Active","Monitoring","Signed","Passed"]}].map((f,i)=>(
          <select key={i} value={f.v} onChange={e=>f.s(e.target.value)} style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:"3px",padding:"7px 10px",color:T.text,fontSize:"10px",fontFamily:"'Space Mono',monospace",outline:"none"}}>
            {f.o.map(o=><option key={o} value={o}>{o}</option>)}
          </select>
        ))}
      </div>
      <Card style={{padding:0,overflow:"hidden"}}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:"700px"}}>
            <thead>
              <tr style={{borderBottom:`1px solid ${T.border}`}}>
                {["Player","Pos","Club","Nationality","Fee","Contract","Verdict","By","",""].map(h=>(
                  <th key={h} style={{padding:"9px 12px",textAlign:"left",fontFamily:"'Space Mono',monospace",fontSize:"8px",color:T.muted,letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:"normal",whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length===0&&<tr><td colSpan={9} style={{padding:"28px 12px",color:T.muted,fontSize:"13px",textAlign:"center"}}>No players match your filters</td></tr>}
              {filtered.map(p=>(
                <tr key={p.id} onClick={()=>onNav("player",p)} style={{borderBottom:`1px solid ${T.dim}`,cursor:"pointer",transition:"background 0.1s"}}
                  onMouseEnter={e=>e.currentTarget.style.background=T.dim} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{padding:"11px 12px"}}><div style={{fontSize:"13px",color:T.text,fontWeight:500}}>{p.name}</div><Mono size="9px">{p.dob}</Mono></td>
                  <td style={{padding:"11px 12px"}}><PBadge pos={p.position}/></td>
                  <td style={{padding:"11px 12px",fontSize:"12px",color:T.text,whiteSpace:"nowrap"}}>{p.currentClub}</td>
                  <td style={{padding:"11px 12px"}}><Mono size="10px" color={T.text}>{p.nationality}</Mono></td>
                  <td style={{padding:"11px 12px"}}><Mono size="10px" color={T.text}>{p.transferFee||"TBC"}</Mono></td>
                  <td style={{padding:"11px 12px"}}><Mono size="10px">{p.contractExpiry||"TBC"}</Mono></td>
                  <td style={{padding:"11px 12px"}}><VBadge v={p.recommendation?.verdict}/></td>
                  <td style={{padding:"11px 12px"}}><Mono size="10px">{p.addedBy||"—"}</Mono></td>
                  <td style={{padding:"11px 12px"}} onClick={e=>{e.stopPropagation();if(window.confirm("Delete "+p.name+"?"))onDelete(p.id);}}>
                    <span style={{color:T.muted,cursor:"pointer",fontSize:"16px",lineHeight:1}}>×</span>
                  </td>
                  <td style={{padding:"11px 12px"}} onClick={e=>e.stopPropagation()}>
                    <button onClick={e=>{e.stopPropagation();onArchive&&onArchive(p.id);}}
                      style={{background:"none",border:`1px solid ${T.border}`,borderRadius:"3px",padding:"3px 8px",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:"8px",color:T.muted,letterSpacing:"0.07em",whiteSpace:"nowrap"}}
                      title="Archive player">◻ Archive</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// Last Seen / Traffic Light
function LastSeenCard({player, onEdit}) {
  const getSignal = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split("/");
    if (parts.length !== 3) return null;
    const d = new Date(parseInt(parts[2]), parseInt(parts[1])-1, parseInt(parts[0]));
    const days = Math.floor((new Date() - d) / (1000*60*60*24));
    if (days <= 42) return {color:"#3fb950", label:"Recent", days};
    if (days <= 84) return {color:T.amber, label:"Amber", days};
    if (days <= 182) return {color:"#e06c75", label:"Overdue", days};
    return {color:"#a32d2d", label:"Long overdue", days};
  };
  const sig = getSignal(player.lastSeen);
  return (
    <div style={{background:T.panel,border:`1px solid ${T.dim}`,padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div>
        <SL>Last Seen / Met</SL>
        {player.lastSeen
          ? <div style={{fontSize:"12px",color:T.text}}>{player.lastSeen}</div>
          : <button onClick={()=>onEdit(player)} style={{background:"none",border:"none",padding:0,cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:"10px",color:T.muted,letterSpacing:"0.07em"}}>+ Add date</button>}
        {sig&&<Mono size="9px" style={{marginTop:"2px"}}>{sig.days}d ago</Mono>}
      </div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"}}>
        <div style={{width:"18px",height:"18px",borderRadius:"50%",background:sig?sig.color:T.dim,border:`2px solid ${sig?sig.color+"88":T.border}`,boxShadow:sig?`0 0 8px ${sig.color}66`:"none",transition:"all 0.3s"}}/>
        {sig&&<Mono size:"8px" color={sig.color} style={{fontSize:"8px",fontFamily:"'Space Mono',monospace",color:sig.color}}>{sig.label}</Mono>}
        {!sig&&!player.lastSeen&&<Mono size="8px" color={T.muted}>Not set</Mono>}
      </div>
    </div>
  );
}


// Player Detail
function PlayerDetail({player,clubs,proposals,onBack,onEdit,onAddProposal,onNav,onArchive}) {
  const [showForm,setShowForm]=useState(false);
  const [propClub,setPropClub]=useState("");
  const [propNote,setPropNote]=useState("");
  const [propStatus,setPropStatus]=useState("Proposed");
  const [showShare,setShowShare]=useState(false);
  const [archiveDone,setArchiveDone]=useState(false);
  const playerProps=proposals.filter(pr=>pr.playerId===player.id).sort((a,b)=>b.date>a.date?1:-1);
  const vc={SIGN:{c:T.green,bg:T.greenDim,b:T.greenBorder},MONITOR:{c:T.amber,bg:T.amberDim,b:T.amberBorder},PASS:{c:T.red,bg:T.redDim,b:T.redBorder}}[player.recommendation?.verdict]||{c:T.muted,bg:T.dim,b:T.border};
  const avg=player.technical&&player.tactical&&player.physical&&player.mental?((player.technical.score+player.tactical.score+player.physical.score+player.mental.score)/4).toFixed(1):null;
  const submitProp=()=>{if(!propClub)return;onAddProposal({id:uid(),playerId:player.id,clubId:propClub,status:propStatus,notes:propNote,date:today()});setPropClub("");setPropNote("");setShowForm(false);};
  const handleArchive=()=>{
    if(onArchive){
      onArchive(player.id);
      if(!player.archived){
        setArchiveDone(true);
        setTimeout(()=>onNav("players"),1200);
      }
    }
  };
  return (
    <div style={{animation:"fadeIn 0.3s ease"}}>
      {archiveDone&&<div style={{position:"fixed",top:"20px",right:"24px",zIndex:999,background:T.panel,border:`1px solid ${T.amber}`,borderRadius:"6px",padding:"12px 18px",boxShadow:"0 4px 20px rgba(0,0,0,0.3)",display:"flex",alignItems:"center",gap:"10px"}}>
        <span style={{color:T.amber,fontSize:"14px"}}>◻</span>
        <Mono size="11px" color={T.amber}>{player.name} archived · returning to list…</Mono>
      </div>}
      {showShare&&<ShareModal player={player} onClose={()=>setShowShare(false)}/>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:"9px",letterSpacing:"0.1em"}}>← BACK</button>
        <div style={{display:"flex",gap:"8px"}}>
          {player.videoUrl&&<a href={player.videoUrl} target="_blank" rel="noopener" style={{padding:"5px 12px",border:`1px solid ${T.border}`,borderRadius:"3px",color:T.muted,fontSize:"9px",fontFamily:"'Space Mono',monospace",letterSpacing:"0.08em"}}>▶ VIDEO</a>}
          {player.transfermarktUrl&&<a href={player.transfermarktUrl} target="_blank" rel="noopener" style={{padding:"5px 12px",border:`1px solid ${T.border}`,borderRadius:"3px",color:T.muted,fontSize:"9px",fontFamily:"'Space Mono',monospace",letterSpacing:"0.08em"}}>TM ↗</a>}
          <Btn onClick={()=>setShowShare(true)} small variant="outline">📤 Share</Btn>
          <Btn onClick={()=>onEdit(player)} small variant="outline">Edit</Btn>
          {onArchive&&<Btn onClick={handleArchive} small variant="outline" style={{color:player.archived?T.green:T.amber,borderColor:player.archived?T.green:T.amber}}>{player.archived?"↩ Restore":"◻ Archive"}</Btn>}
        </div>
      </div>
      <div style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:"4px",padding:"20px 22px",marginBottom:"2px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"12px"}}>
          <div>
            <div style={{display:"flex",gap:"8px",marginBottom:"7px",flexWrap:"wrap"}}><PBadge pos={player.position}/>{player.status&&<Badge>{player.status}</Badge>}</div>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:"26px",color:T.gold,marginBottom:"5px"}}>{player.name}</div>
            <div style={{display:"flex",gap:"14px",flexWrap:"wrap"}}>
              {[player.currentClub,player.nationality,player.dob].filter(Boolean).map((v,i)=><Mono key={i} size="11px" color={T.text}>{v}</Mono>)}
            </div>
          </div>
          {player.recommendation?.verdict&&player.status!=="Signed"&&(
            <div style={{textAlign:"center"}}>
              <div style={{background:vc.bg,border:`1px solid ${vc.b}`,borderRadius:"3px",padding:"9px 18px",marginBottom:"3px"}}>
                <span style={{fontFamily:"'Space Mono',monospace",fontSize:"18px",fontWeight:700,color:vc.c,letterSpacing:"0.12em"}}>{player.recommendation.verdict}</span>
              </div>
              <Mono size="9px">Priority: {player.recommendation.priority}</Mono>
            </div>
          )}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:"2px",marginBottom:"2px"}}>
        {[["Fee",player.transferFee||"TBC"],["Contract",player.contractExpiry||"TBC"],["Foot",player.foot||"—"],["Height/Wt",[player.height,player.weight].filter(Boolean).join("/")||"—"],["Intl",player.international||"N/A"]].map(([l,v])=>(
          <div key={l} style={{background:T.panel,border:`1px solid ${T.dim}`,padding:"12px 14px"}}>
            <SL>{l}</SL><div style={{fontSize:"12px",color:T.text}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:player.status==="Signed"?"1fr 1fr":"1fr",gap:"2px",marginBottom:"2px"}}>
        <LastSeenCard player={player} onEdit={onEdit}/>
        {(player.status==="Signed"&&(userRole==="admin"||userRole==="standard"))&&<div style={{background:T.panel,border:`1px solid ${T.dim}`,padding:"12px 14px"}}>
          <SL>Rep Contract</SL>
          {player.repContractUrl
            ? <a href={player.repContractUrl} target="_blank" rel="noopener" style={{fontSize:"12px",color:T.gold,textDecoration:"none",fontFamily:"'Space Mono',monospace",letterSpacing:"0.04em"}}>📄 View Contract ↗</a>
            : <button onClick={()=>onEdit(player)} style={{background:"none",border:"none",padding:0,cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:"10px",color:T.muted,letterSpacing:"0.07em"}}>+ Add contract link</button>}
        </div>}
      </div>
      {player.description&&(
        <div style={{background:T.panel,border:`1px solid ${T.dim}`,padding:"18px 22px",marginBottom:"2px"}}>
          <SL>Scout Description</SL>
          <p style={{fontSize:"13px",lineHeight:1.75,color:"#9a9aaa",margin:0}}>{player.description}</p>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"2px",marginBottom:"2px"}}>
        <Card>
          <SL>Attributes {avg&&<span style={{color:T.gold}}>· {avg}/10 avg</span>}</SL>
          {["technical","tactical","physical","mental"].map(k=>player[k]&&<ScoreBar key={k} score={player[k].score} label={k[0].toUpperCase()+k.slice(1)}/>)}
          <div style={{marginTop:"12px",borderTop:`1px solid ${T.border}`,paddingTop:"10px"}}>
            {["technical","tactical","physical","mental"].map(k=>player[k]?.notes&&<p key={k} style={{margin:"0 0 4px",fontSize:"11px",color:T.muted}}><span style={{color:"#777"}}>{k[0].toUpperCase()+k.slice(1)}: </span>{player[k].notes}</p>)}
          </div>
        </Card>
        <Card>
          <SL>League & Market</SL>
          {player.leagueQuality&&(<><TierBadge tier={player.leagueQuality.level}/><p style={{fontSize:"12px",color:T.muted,margin:"8px 0 10px",lineHeight:1.5}}>{player.leagueQuality.notes}</p>
          {(player.leagueQuality.eciRanking||player.leagueQuality.eloRanking)&&(
            <div style={{display:"flex",gap:"8px",marginBottom:"10px"}}>
              {player.leagueQuality.eciRanking&&<div style={{background:T.dim,border:`1px solid ${T.border}`,borderRadius:"3px",padding:"5px 10px"}}><Mono size="8px" color={T.muted}>ECI</Mono><div style={{fontSize:"13px",color:T.gold,fontFamily:"'Space Mono',monospace",marginTop:"2px"}}>{player.leagueQuality.eciRanking}</div></div>}
              {player.leagueQuality.eloRanking&&<div style={{background:T.dim,border:`1px solid ${T.border}`,borderRadius:"3px",padding:"5px 10px"}}><Mono size="8px" color={T.muted}>ELO</Mono><div style={{fontSize:"13px",color:T.gold,fontFamily:"'Space Mono',monospace",marginTop:"2px"}}>{player.leagueQuality.eloRanking}</div></div>}
            </div>
          )}
          </>)}
          {player.recommendation&&(
            <div style={{borderTop:`1px solid ${T.border}`,paddingTop:"12px"}}>
              <SL>Target Market</SL>
              <div style={{fontSize:"13px",color:T.text,fontWeight:500,marginBottom:"6px"}}>{player.recommendation.suitableMarket}</div>
              <p style={{fontSize:"12px",color:T.muted,margin:"0 0 12px",lineHeight:1.5}}>{player.recommendation.rationale}</p>
              {player.recommendation.clubRecommendations?.length>0&&(
                <>
                  <SL>Club Recommendations</SL>
                  {player.recommendation.clubRecommendations.map((cr,i)=>(
                    <div key={i} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:"3px",padding:"10px 12px",marginBottom:"6px"}}>
                      <div style={{display:"flex",gap:"8px",alignItems:"center",marginBottom:"4px"}}>
                        <span style={{fontFamily:"'DM Serif Display',serif",fontSize:"14px",color:T.gold}}>{cr.club}</span>
                        {cr.league&&<Badge color={T.blue} bg={T.blueDim}>{cr.league}</Badge>}
                      </div>
                      <p style={{fontSize:"11px",color:T.muted,margin:0,lineHeight:1.5}}>{cr.rationale}</p>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </Card>
      </div>
      {player.notes&&(
        <div style={{background:T.panel,border:`1px solid ${T.dim}`,borderLeft:`3px solid ${T.gold}`,padding:"16px 22px",marginBottom:"2px"}}>
          <SL>Notes & Business Case</SL>
          <p style={{fontSize:"13px",color:T.muted,margin:0,lineHeight:1.65}}>{player.notes}</p>
        </div>
      )}
      {/* Statistical Data section */}
      {player.fbrefUrl&&(
        <div style={{background:T.panel,border:`1px solid ${T.dim}`,padding:"16px 22px",marginBottom:"2px"}}>
          <SL>Statistical Data</SL>
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginBottom:"10px"}}>
            <a href={player.fbrefUrl} target="_blank" rel="noopener" style={{display:"inline-flex",alignItems:"center",gap:"6px",padding:"7px 13px",background:T.blueDim,border:`1px solid #1e3a5f`,borderRadius:"3px",color:T.blue,fontSize:"9px",fontFamily:"'Space Mono',monospace",letterSpacing:"0.09em",textDecoration:"none"}}>📊 FBREF SCOUTING REPORT ↗</a>
            {player.transfermarktUrl&&<a href={player.transfermarktUrl} target="_blank" rel="noopener" style={{display:"inline-flex",alignItems:"center",gap:"5px",padding:"7px 13px",background:T.dim,border:`1px solid ${T.border}`,borderRadius:"3px",color:T.muted,fontSize:"9px",fontFamily:"'Space Mono',monospace",letterSpacing:"0.09em",textDecoration:"none"}}>TM PROFILE ↗</a>}
          </div>
          <p style={{fontSize:"11px",color:T.muted,margin:0,lineHeight:1.5}}>Full per-90 statistics, percentile rankings and scouting report available on FBref. Open the report to view passing, shooting, defensive and possession data in context of peer group.</p>
        </div>
      )}
      <Card style={{marginTop:"2px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
          <SL style={{marginBottom:0}}>Club Proposals & Activity ({playerProps.length})</SL>
          <Btn onClick={()=>setShowForm(!showForm)} small variant={showForm?"ghost":"outline"}>{showForm?"Cancel":"+ Log Proposal"}</Btn>
        </div>
        {showForm&&(
          <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:"3px",padding:"14px",marginBottom:"14px"}}>
            <SL>New Proposal</SL>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"10px"}}>
              <div>
                <label style={{display:"block",fontFamily:"'Space Mono',monospace",fontSize:"9px",color:T.muted,letterSpacing:"0.13em",textTransform:"uppercase",marginBottom:"5px"}}>Club *</label>
                <select value={propClub} onChange={e=>setPropClub(e.target.value)} style={{width:"100%",background:T.panel,border:`1px solid ${T.border}`,borderRadius:"3px",padding:"7px 10px",color:T.text,fontSize:"12px",outline:"none"}}>
                  <option value="">Select club…</option>
                  {clubs.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <Sel label="Status" value={propStatus} onChange={setPropStatus} options={["Proposed","Shown Interest","Meeting Arranged","Offer Made","Rejected","Signed"]} small/>
              <div style={{display:"flex",alignItems:"flex-end",paddingBottom:"1px"}}>
                <Btn onClick={submitProp} disabled={!propClub} fullWidth>Save</Btn>
              </div>
            </div>
            <Inp label="Notes" value={propNote} onChange={setPropNote} placeholder="e.g. Sent profile to John Smith. Awaiting response." small/>
          </div>
        )}
        {playerProps.length===0&&!showForm&&<Mono size="11px">No proposals logged yet for this player</Mono>}
        {playerProps.map(pr=>{
          const club=clubs.find(c=>c.id===pr.clubId);
          return (
            <div key={pr.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${T.dim}`,cursor:"pointer"}} onClick={()=>onNav("clubs")}>
              <div>
                <span style={{fontSize:"13px",color:T.text,fontWeight:500}}>{club?.name||"Unknown Club"}</span>
                {pr.notes&&<p style={{fontSize:"11px",color:T.muted,margin:"2px 0 0"}}>{pr.notes}</p>}
                <Mono size="9px" style={{marginTop:"2px"}}>{pr.date} · {pr.addedBy}</Mono>
              </div>
              <PropBadge status={pr.status}/>
            </div>
          );
        })}
      </Card>
      <div style={{marginTop:"10px"}}><Mono size="9px" color={T.dim}>Added {player.dateAdded} by {player.addedBy||"—"} · ID: {player.id}</Mono></div>
    </div>
  );
}

// Player Form
const EMPTY={name:"",dob:"",nationality:"",currentClub:"",position:"GK",foot:"Right",height:"",weight:"",international:"",transferFee:"",contractExpiry:"",description:"",technical:{score:6,notes:""},tactical:{score:6,notes:""},physical:{score:6,notes:""},mental:{score:6,notes:""},leagueQuality:{level:"Mid",notes:"",eciRanking:"",eloRanking:""},recommendation:{verdict:"MONITOR",priority:"MEDIUM",suitableMarket:"",rationale:"",clubRecommendations:[]},notes:"",source:"",videoUrl:"",transfermarktUrl:"",fbrefUrl:"",status:"Monitoring",addedBy:""};

function PlayerForm({initial,onSave,onCancel,currentUser}) {
  const [f,setF]=useState(()=>({...EMPTY,...(initial||{}),addedBy:(initial?.addedBy)||currentUser}));
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const setN=(k,sk,v)=>setF(p=>({...p,[k]:{...p[k],[sk]:v}}));
  const save=()=>{if(!f.name.trim())return alert("Player name is required");onSave({...f,id:f.id||uid(),dateAdded:f.dateAdded||today()});};
  const SP=({k,label})=>(
    <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:"3px",padding:"12px",marginBottom:"8px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"7px"}}>
        <Mono size="9px">{label}</Mono>
        <div style={{display:"flex",gap:"3px"}}>
          {[1,2,3,4,5,6,7,8,9,10].map(n=>(
            <button key={n} onClick={()=>setN(k,"score",n)} style={{width:"18px",height:"18px",borderRadius:"2px",border:"none",cursor:"pointer",fontSize:"8px",fontFamily:"'Space Mono',monospace",
              background:n<=f[k].score?(f[k].score>=8?T.greenBorder:f[k].score>=6?T.amberBorder:T.redBorder):T.dim,
              color:n<=f[k].score?"#fff":T.muted}}>{n}</button>
          ))}
        </div>
      </div>
      <input value={f[k].notes} onChange={e=>setN(k,"notes",e.target.value)} placeholder={label+" notes…"}
        style={{width:"100%",background:"transparent",border:"none",outline:"none",color:T.muted,fontSize:"11px",fontFamily:"'DM Sans',sans-serif"}}/>
    </div>
  );
  return (
    <div style={{animation:"fadeIn 0.3s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:"22px",color:T.text}}>{initial?"Edit Player":"Add Player"}</div>
        <button onClick={onCancel} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:"9px",letterSpacing:"0.1em"}}>← CANCEL</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
        <div>
          <Card style={{marginBottom:"2px"}}>
            <SL>Player Information</SL>
            <Inp label="Full Name" value={f.name} onChange={v=>set("name",v)} req placeholder="FIRST LAST"/>
            <Inp label="Date of Birth" value={f.dob} onChange={v=>set("dob",v)} placeholder="DD/MM/YYYY (age)"/>
            <Inp label="Nationality" value={f.nationality} onChange={v=>set("nationality",v)}/>
            <Inp label="Current Club" value={f.currentClub} onChange={v=>set("currentClub",v)}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
              <Sel label="Position" value={f.position} onChange={v=>set("position",v)} options={ALL_POS.slice(1)}/>
              <Sel label="Foot" value={f.foot} onChange={v=>set("foot",v)} options={["Right","Left","Both"]}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
              <Inp label="Height" value={f.height} onChange={v=>set("height",v)} placeholder="1.85m"/>
              <Inp label="Weight" value={f.weight} onChange={v=>set("weight",v)} placeholder="78kg"/>
            </div>
            <Inp label="International Caps" value={f.international} onChange={v=>set("international",v)} placeholder="e.g. 24 caps"/>
          </Card>
          <Card style={{marginBottom:"2px"}}>
            <SL>Contract & Transfer</SL>
            <Inp label="Transfer Fee" value={f.transferFee} onChange={v=>set("transferFee",v)} placeholder="e.g. TBC / €4m / Free"/>
            <Inp label="Contract Expiry" value={f.contractExpiry} onChange={v=>set("contractExpiry",v)} placeholder="DD/MM/YYYY"/>
            <Sel label="Status" value={f.status} onChange={v=>set("status",v)} options={["Active","Monitoring","Signed","Passed"]}/>
            <Inp label="Source" value={f.source} onChange={v=>set("source",v)} placeholder="e.g. Zikas / AV / Event"/>
            <Inp label="Added By" value={f.addedBy} onChange={v=>set("addedBy",v)} placeholder="Your initials"/>
          </Card>
          <Card>
            <SL>Links</SL>
            <Inp label="Video URL" value={f.videoUrl} onChange={v=>set("videoUrl",v)} placeholder="https://vimeo.com/…"/>
            <Inp label="Transfermarkt URL" value={f.transfermarktUrl} onChange={v=>set("transfermarktUrl",v)} placeholder="https://transfermarkt.co.uk/…"/>
            <Inp label="FBref URL" value={f.fbrefUrl||""} onChange={v=>set("fbrefUrl",v)} placeholder="https://fbref.com/en/players/…"/>
          </Card>
          <Card>
            <SL>Scouting & Contract</SL>
            <Inp label="Last Seen / Met (DD/MM/YYYY)" value={f.lastSeen||""} onChange={v=>set("lastSeen",v)} placeholder="17/06/2026"/>
            {f.status==="Signed"&&<Inp label="Rep Contract Link" value={f.repContractUrl||""} onChange={v=>set("repContractUrl",v)} placeholder="https://drive.google.com/… or Dropbox link"/>}
          </Card>
        </div>
        <div>
          <Card style={{marginBottom:"2px"}}>
            <SL>Scout Description</SL>
            <Inp multi value={f.description} onChange={v=>set("description",v)} placeholder="3–4 sentence professional description…"/>
          </Card>
          <Card style={{marginBottom:"2px"}}>
            <SL>Attribute Scores</SL>
            <SP k="technical" label="Technical"/><SP k="tactical" label="Tactical"/><SP k="physical" label="Physical"/><SP k="mental" label="Mental"/>
          </Card>
          <Card style={{marginBottom:"2px"}}>
            <SL>League Quality & Rankings</SL>
            <Sel label="Level" value={f.leagueQuality.level} onChange={v=>setN("leagueQuality","level",v)} options={["Elite","High","Mid","Development","Low"]}/>
            <Inp label="Context" value={f.leagueQuality.notes} onChange={v=>setN("leagueQuality","notes",v)} placeholder="e.g. Allsvenskan – ECI 300"/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
              <Inp label="ECI Ranking" value={f.leagueQuality.eciRanking||""} onChange={v=>setN("leagueQuality","eciRanking",v)} placeholder="e.g. 300"/>
              <Inp label="Elo Ranking" value={f.leagueQuality.eloRanking||""} onChange={v=>setN("leagueQuality","eloRanking",v)} placeholder="e.g. 350"/>
            </div>
          </Card>
          <Card style={{marginBottom:"2px"}}>
            <SL>Recommendation</SL>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"10px"}}>
              <Sel label="Verdict" value={f.recommendation.verdict} onChange={v=>setN("recommendation","verdict",v)} options={["SIGN","MONITOR","PASS"]}/>
              <Sel label="Priority" value={f.recommendation.priority} onChange={v=>setN("recommendation","priority",v)} options={["HIGH","MEDIUM","LOW"]}/>
              <Inp label="Market" value={f.recommendation.suitableMarket} onChange={v=>setN("recommendation","suitableMarket",v)} placeholder="e.g. Championship"/>
            </div>
            <Inp multi value={f.recommendation.rationale} onChange={v=>setN("recommendation","rationale",v)} placeholder="Why should 1863 pursue this player?"/>
          </Card>
          <Card style={{marginBottom:"14px"}}>
            <SL>Internal Notes</SL>
            <Inp multi value={f.notes} onChange={v=>set("notes",v)} placeholder="Agent situation, club interest, risks…"/>
          </Card>
          <div style={{display:"flex",gap:"8px",justifyContent:"flex-end"}}>
            <Btn onClick={onCancel} variant="ghost">Cancel</Btn>
            <Btn onClick={save}>Save Player</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// AI Scout
const SCOUT_SYS=`You are an elite football scout for 1863, a boutique sports agency. Research the given player and produce a professional scouting profile.

Search for: age, nationality, position, contract details, transfer value, international caps, recent stats, physical attributes, recent performances, ECI ranking, Elo ranking.

Assess four dimensions 1-10: Technical, Tactical, Physical, Mental.
Assess league quality level (Elite/High/Mid/Development/Low) and ECI/Elo equivalent clubs for context.
Give SIGN/MONITOR/PASS recommendation with suitable target market.
Make 2-3 specific club recommendations with rationale (e.g. "Crystal Palace – would suit their high-tempo pressing system and their RB left vacated by injury").
Find: Transfermarkt URL, FBref URL (fbref.com), video highlights URL (Vimeo/YouTube).

CRITICAL OUTPUT RULES:
- Your ENTIRE response must be ONE valid JSON object.
- Begin with { and end with } — no text, markdown, code fences, or explanation outside the JSON.
- All string values must be properly escaped (no unescaped quotes or newlines inside strings).
- Use null for any field you cannot find.

JSON schema:
{
  "name": "Full Name",
  "dob": "DD/MM/YYYY (age)",
  "nationality": "Country",
  "currentClub": "Club Name",
  "position": "GK/LB/RB/CB/DM/CM/AM/LW/RW/ST",
  "foot": "Right/Left/Both",
  "height": "1.85m",
  "weight": "78kg",
  "international": "X caps",
  "transferFee": "€Xm or TBC",
  "contractExpiry": "DD/MM/YYYY",
  "description": "3-4 sentence professional scout description",
  "notes": "Agent situation, club interest, risks, business case",
  "technical": {"score": 7, "notes": "brief notes"},
  "tactical": {"score": 7, "notes": "brief notes"},
  "physical": {"score": 7, "notes": "brief notes"},
  "mental": {"score": 7, "notes": "brief notes"},
  "leagueQuality": {"level": "Mid", "notes": "ECI ~300 — equivalent to Aberdeen, Rosenborg level", "eciRanking": "300", "eloRanking": "350"},
  "recommendation": {
    "verdict": "SIGN",
    "priority": "HIGH",
    "suitableMarket": "Championship / League One",
    "rationale": "Why 1863 should pursue this player",
    "clubRecommendations": [
      {"club": "Club Name", "league": "League", "rationale": "Why this specific club suits this player"},
      {"club": "Club Name", "league": "League", "rationale": "Why this specific club suits this player"}
    ]
  },
  "transfermarktUrl": "https://transfermarkt.co.uk/...",
  "fbrefUrl": "https://fbref.com/en/players/...",
  "videoUrl": "https://vimeo.com/... or https://youtube.com/..."
}`;
const STAGES=["Searching player data","Sourcing stats & footage","Assessing attributes","Evaluating market","Generating profile"];

function ScoutView({onSave,currentUser}) {
  const [name,setName]=useState("");
  const [club,setClub]=useState("");
  const [loading,setLoading]=useState(false);
  const [stage,setStage]=useState(0);
  const [profile,setProfile]=useState(null);
  const [error,setError]=useState(null);
  const [saved,setSaved]=useState(false);
  const parse=(text)=>{
    if(!text||typeof text!=="string")throw new Error("No text response from AI");
    // 1. Strip markdown fences, BOM, zero-width chars
    let c=text.replace(/^\uFEFF/,"").replace(/```json\s*/g,"```").replace(/```\s*/g,"").replace(/[\u200B-\u200D\uFEFF]/g,"").trim();
    // 2. Try direct parse
    try{const r=JSON.parse(c);if(r&&typeof r==="object")return r;}catch{}
    // 3. Extract first { ... } block using bracket depth (handles nested objects)
    let start=-1,depth=0,inStr=false,esc=false;
    for(let i=0;i<c.length;i++){
      const ch=c[i];
      if(esc){esc=false;continue;}
      if(ch==="\\"&&inStr){esc=true;continue;}
      if(ch==='"'){inStr=!inStr;continue;}
      if(inStr)continue;
      if(ch==="{"){if(start===-1)start=i;depth++;}
      else if(ch==="}"){depth--;if(depth===0&&start!==-1){
        try{const r=JSON.parse(c.slice(start,i+1));if(r&&typeof r==="object")return r;}catch{}
        // try sanitising control chars and re-parsing
        try{const s=c.slice(start,i+1).replace(/[\x00-\x1F\x7F]/g," ").replace(/,\s*([}\]])/g,"$1");const r=JSON.parse(s);if(r&&typeof r==="object")return r;}catch{}
      }}
    }
    // 4. Last resort — regex for top-level keys
    try{
      const grab=(k)=>{const m=c.match(new RegExp(`"${k}"\\s*:\\s*"([^"]*)"`,));return m?m[1]:null;};
      const grabN=(k)=>{const m=c.match(new RegExp(`"${k}"\\s*:\\s*([\\d.]+)`));return m?parseFloat(m[1]):null;};
      const name=grab("name")||grab("playerName");
      if(!name)throw new Error("no name");
      return{name,currentClub:grab("currentClub")||grab("club"),nationality:grab("nationality"),dob:grab("dob"),position:grab("position")||"CM",description:grab("description")||grab("summary"),notes:grab("notes"),transferFee:grab("transferFee"),contractExpiry:grab("contractExpiry"),foot:grab("foot"),height:grab("height"),weight:grab("weight"),international:grab("international"),transfermarktUrl:grab("transfermarktUrl"),videoUrl:grab("videoUrl"),technical:{score:grabN("technical")||6,notes:""},tactical:{score:grabN("tactical")||6,notes:""},physical:{score:grabN("physical")||6,notes:""},mental:{score:grabN("mental")||6,notes:""},leagueQuality:{level:grab("level")||"Mid",notes:grab("leagueNotes")||""},recommendation:{verdict:grab("verdict")||"MONITOR",priority:grab("priority")||"MEDIUM",suitableMarket:grab("suitableMarket")||"",rationale:grab("rationale")||""}};
    }catch{}
    throw new Error("Could not parse scouting data — please try again. (Tip: be more specific with the player name)");
  };
  const run=async()=>{
    if(!name.trim())return;
    setLoading(true);setProfile(null);setError(null);setSaved(false);setStage(1);
    const timers=STAGES.map((_,i)=>setTimeout(()=>setStage(i+2),(i+1)*2200));
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1500,system:SCOUT_SYS,tools:[{type:"web_search_20250305",name:"web_search"}],
          messages:[{role:"user",content:`Scout: ${name}${club?` (${club})`:""}. Find current stats, contract, recent performances.`}]})});
      timers.forEach(clearTimeout);setStage(5);
      const data=await res.json();
      const tb=data.content?.find(b=>b.type==="text");
      if(!tb)throw new Error("No response from API");
      setProfile(parse(tb.text));
    }catch(e){timers.forEach(clearTimeout);setError(e.message||"Failed");}
    setLoading(false);setStage(0);
  };
  const handleSave=()=>{if(!profile)return;onSave({...EMPTY,...profile,id:uid(),source:"AI Scout",addedBy:currentUser,dateAdded:today(),status:"Monitoring"});setSaved(true);};
  const vc=profile?.recommendation?.verdict?{SIGN:{c:T.green,bg:T.greenDim,b:T.greenBorder},MONITOR:{c:T.amber,bg:T.amberDim,b:T.amberBorder},PASS:{c:T.red,bg:T.redDim,b:T.redBorder}}[profile.recommendation.verdict]:null;
  return (
    <div style={{animation:"fadeIn 0.3s ease"}}>
      <div style={{marginBottom:"20px"}}>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:"22px",color:T.text,marginBottom:"3px"}}>AI Scout Agent</div>
        <Mono size="11px">Enter a player name to generate a full scouting report powered by live web search</Mono>
      </div>
      <Card style={{marginBottom:"12px"}}>
        <SL>// New Assessment</SL>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginBottom:"14px"}}>
          <Inp label="Player Name *" value={name} onChange={setName} placeholder="e.g. Cameron Devlin"/>
          <Inp label="Current Club" value={club} onChange={setClub} placeholder="e.g. Hearts"/>
        </div>
        <Btn onClick={run} disabled={loading||!name.trim()}>{loading?"Scouting…":"→ Run Scout Report"}</Btn>
        <div style={{marginTop:"12px",display:"flex",gap:"8px",flexWrap:"wrap"}}>
          {["Martin Dubravka · Newcastle United","Jalal Abdulai · Elfsborg","Cameron Devlin · Hearts"].map(ex=>{const[n,c]=ex.split(" · ");return <button key={ex} onClick={()=>{setName(n);setClub(c);}} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:"3px",padding:"4px 10px",color:T.muted,fontSize:"9px",fontFamily:"'Space Mono',monospace",cursor:"pointer",letterSpacing:"0.07em"}}>{ex}</button>;})}
        </div>
      </Card>
      {loading&&(
        <Card>
          <Mono color={T.gold} size="9px">// Analysing {name}</Mono>
          <div style={{marginTop:"14px"}}>
            {STAGES.map((l,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:"10px",padding:"7px 0",opacity:stage>i+1?0.4:stage===i+1?1:0.18,transition:"all 0.3s"}}>
                <div style={{width:"14px",height:"14px",borderRadius:"50%",background:stage>i+1?T.greenBorder:stage===i+1?T.amber:T.dim,border:`1px solid ${stage>i+1?T.green:stage===i+1?T.amber:T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"8px",color:"#fff",flexShrink:0,animation:stage===i+1?"pulse 1.5s infinite":"none"}}>{stage>i+1?"✓":""}</div>
                <Mono size="10px" color={stage>i+1?T.green:stage===i+1?T.amber:T.muted}>{l}</Mono>
              </div>
            ))}
          </div>
        </Card>
      )}
      {error&&<Card style={{borderColor:T.redBorder,background:T.redDim,marginBottom:"12px"}}><Mono color={T.red}>Error: {error}. Please try again.</Mono></Card>}
      {profile&&!loading&&(
        <div style={{animation:"slideUp 0.4s ease"}}>
          <div style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:"4px",padding:"20px 22px",marginBottom:"2px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"12px"}}>
              <div>
                <div style={{display:"flex",gap:"8px",marginBottom:"7px"}}><PBadge pos={profile.position}/></div>
                <div style={{fontFamily:"'DM Serif Display',serif",fontSize:"24px",color:T.gold,marginBottom:"5px"}}>{profile.name}</div>
                <div style={{display:"flex",gap:"12px",flexWrap:"wrap"}}>{[profile.currentClub,profile.nationality,profile.dob].filter(Boolean).map((v,i)=><Mono key={i} size="11px" color={T.text}>{v}</Mono>)}</div>
              </div>
              {vc&&<div style={{textAlign:"center"}}><div style={{background:vc.bg,border:`1px solid ${vc.b}`,borderRadius:"3px",padding:"8px 16px",marginBottom:"3px"}}><span style={{fontFamily:"'Space Mono',monospace",fontSize:"16px",fontWeight:700,color:vc.c,letterSpacing:"0.12em"}}>{profile.recommendation.verdict}</span></div><Mono size="9px">Priority: {profile.recommendation.priority}</Mono></div>}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"2px",marginBottom:"2px"}}>
            <Card><SL>Attributes</SL>{["technical","tactical","physical","mental"].map(k=>profile[k]&&<ScoreBar key={k} score={profile[k].score} label={k[0].toUpperCase()+k.slice(1)}/>)}</Card>
            <Card><SL>Description</SL><p style={{fontSize:"13px",lineHeight:1.7,color:"#9a9aaa",margin:0}}>{profile.description}</p></Card>
          </div>
          {profile.notes&&<Card style={{borderLeft:`3px solid ${T.gold}`,marginBottom:"2px"}}><SL>Notes</SL><p style={{fontSize:"13px",color:T.muted,margin:0,lineHeight:1.65}}>{profile.notes}</p></Card>}
          {(profile.videoUrl||profile.transfermarktUrl)&&(
            <Card style={{marginBottom:"2px"}}>
              <SL>Links</SL>
              <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
                {profile.videoUrl&&<a href={profile.videoUrl} target="_blank" rel="noopener" style={{display:"inline-flex",alignItems:"center",gap:"5px",padding:"7px 13px",background:T.greenDim,border:`1px solid ${T.greenBorder}`,borderRadius:"3px",color:T.green,fontSize:"9px",fontFamily:"'Space Mono',monospace",letterSpacing:"0.09em",textDecoration:"none"}}>▶ VIDEO HIGHLIGHTS ↗</a>}
                {profile.transfermarktUrl&&<a href={profile.transfermarktUrl} target="_blank" rel="noopener" style={{display:"inline-flex",alignItems:"center",gap:"5px",padding:"7px 13px",background:T.dim,border:`1px solid ${T.border}`,borderRadius:"3px",color:T.muted,fontSize:"9px",fontFamily:"'Space Mono',monospace",letterSpacing:"0.09em",textDecoration:"none"}}>📊 TRANSFERMARKT ↗</a>}
              </div>
            </Card>
          )}
          <Card style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontSize:"13px",color:T.text,marginBottom:"2px"}}>Save to shared player database?</div><Mono size="9px">All team members will see this player immediately</Mono></div>
            {saved?<Badge color={T.green} bg={T.greenDim}>✓ Saved to database</Badge>:<Btn onClick={handleSave}>+ Save to Database</Btn>}
          </Card>
        </div>
      )}
    </div>
  );
}

// Portfolio View — signed players only
function PortfolioView({players,proposals,clubs,onNav}) {
  const signed=players.filter(p=>p.status==="Signed").sort((a,b)=>a.name.localeCompare(b.name));
  const byPos=signed.reduce((acc,p)=>{const g=p.position||"Other";acc[g]=(acc[g]||[]);acc[g].push(p);return acc;},{});
  const posOrder=["GK","LB","RB","CB","DM","CM","AM","LW","RW","ST"];
  const sortedPos=[...posOrder.filter(k=>byPos[k]),...Object.keys(byPos).filter(k=>!posOrder.includes(k))];
  return (
    <div style={{animation:"fadeIn 0.3s ease"}}>
      <div style={{marginBottom:"24px"}}>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:"26px",color:T.text,marginBottom:"4px"}}>1863 Portfolio</div>
        <Mono size="11px">{signed.length} signed player{signed.length!==1?"s":""} · July 2025</Mono>
      </div>
      {signed.length===0&&(
        <Card><div style={{textAlign:"center",padding:"32px 0"}}><div style={{fontSize:"32px",marginBottom:"12px"}}>★</div><div style={{fontFamily:"'DM Serif Display',serif",fontSize:"18px",color:T.text,marginBottom:"8px"}}>No signed players yet</div><Mono size="10px">Change a player's status to "Signed" to add them to the portfolio</Mono></div></Card>
      )}
      {sortedPos.map(pos=>(
        <div key={pos} style={{marginBottom:"24px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"10px"}}>
            <PBadge pos={pos}/>
            <Mono size="9px" color={T.muted}>{byPos[pos].length} player{byPos[pos].length!==1?"s":""}</Mono>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:"2px"}}>
            {byPos[pos].map(p=>{
              const playerProps=proposals.filter(pr=>pr.playerId===p.id);
              const recentProp=playerProps.sort((a,b)=>b.date>a.date?1:-1)[0];
              return (
                <div key={p.id} onClick={()=>onNav("player",p)} style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:"4px",padding:"16px 18px",cursor:"pointer",transition:"border-color 0.15s",position:"relative"}} onMouseEnter={e=>e.currentTarget.style.borderColor=T.gold} onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"'DM Serif Display',serif",fontSize:"18px",color:T.gold,marginBottom:"4px"}}>{p.name}</div>
                      <div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginBottom:"10px"}}>
                        <Mono size="10px" color={T.text}>{p.currentClub}</Mono>
                        {p.nationality&&<><Mono size="10px">·</Mono><Mono size="10px">{p.nationality}</Mono></>}
                        {p.dob&&<><Mono size="10px">·</Mono><Mono size="10px">{p.dob}</Mono></>}
                      </div>
                      <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
                        {p.contractExpiry&&<div style={{background:T.dim,borderRadius:"3px",padding:"3px 8px"}}><Mono size="8px" color={T.muted}>CONTRACT</Mono><div style={{fontSize:"11px",color:T.text,marginTop:"1px"}}>{p.contractExpiry}</div></div>}
                        {p.transferFee&&<div style={{background:T.dim,borderRadius:"3px",padding:"3px 8px"}}><Mono size="8px" color={T.muted}>FEE</Mono><div style={{fontSize:"11px",color:T.text,marginTop:"1px"}}>{p.transferFee}</div></div>}
                        {p.international&&<div style={{background:T.dim,borderRadius:"3px",padding:"3px 8px"}}><Mono size="8px" color={T.muted}>INTL</Mono><div style={{fontSize:"11px",color:T.text,marginTop:"1px"}}>{p.international}</div></div>}
                      </div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"6px",flexShrink:0,marginLeft:"10px"}}>
                      {p.videoUrl&&<a href={p.videoUrl} target="_blank" rel="noopener" onClick={e=>e.stopPropagation()} style={{display:"inline-flex",alignItems:"center",gap:"4px",padding:"4px 8px",background:T.greenDim,border:`1px solid ${T.greenBorder}`,borderRadius:"3px",color:T.green,fontSize:"8px",fontFamily:"'Space Mono',monospace",letterSpacing:"0.07em",textDecoration:"none"}}>▶ VIDEO</a>}
                      {p.transfermarktUrl&&<a href={p.transfermarktUrl} target="_blank" rel="noopener" onClick={e=>e.stopPropagation()} style={{display:"inline-flex",alignItems:"center",gap:"4px",padding:"4px 8px",background:T.dim,border:`1px solid ${T.border}`,borderRadius:"3px",color:T.muted,fontSize:"8px",fontFamily:"'Space Mono',monospace",letterSpacing:"0.07em",textDecoration:"none"}}>TM</a>}
                    </div>
                  </div>
                  {playerProps.length>0&&(
                    <div style={{borderTop:`1px solid ${T.border}`,paddingTop:"10px",marginTop:"10px"}}>
                      <Mono size="8px" color={T.muted} style={{marginBottom:"6px"}}>ACTIVITY · {playerProps.length} proposal{playerProps.length!==1?"s":""}</Mono>
                      {[recentProp].filter(Boolean).map(pr=>{
                        const c=clubs.find(cl=>cl.id===pr.clubId);
                        return <div key={pr.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:"11px",color:T.text}}>{c?.name||"Unknown Club"}</span><PropBadge status={pr.status}/></div>;
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// Clubs View
function ClubsView({clubs,players,proposals,onSave,onDelete,onNav}) {
  const [search,setSearch]=useState("");
  const [tierF,setTierF]=useState("All");
  const [showForm,setShowForm]=useState(false);
  const [editClub,setEditClub]=useState(null);
  const CDEF={name:"",league:"",country:"England",tier:"High",contactName:"",contactEmail:"",contactPhone:"",multiClub:false,notes:""};
  const [form,setForm]=useState(CDEF);
  const sf=(k,v)=>setForm(p=>({...p,[k]:v}));
  const filtered=clubs.filter(c=>{
    if(search&&![c.name,c.league,c.country].some(v=>v?.toLowerCase().includes(search.toLowerCase())))return false;
    if(tierF!=="All"&&c.tier!==tierF)return false;
    return true;
  });
  const openAdd=()=>{setEditClub(null);setForm(CDEF);setShowForm(true);};
  const openEdit=(c)=>{setEditClub(c);setForm({...c});setShowForm(true);};
  const saveClub=()=>{if(!form.name.trim())return alert("Club name required");onSave({...form,id:editClub?.id||uid(),dateAdded:editClub?.dateAdded||today()});setShowForm(false);setEditClub(null);};
  return (
    <div style={{animation:"fadeIn 0.3s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"18px"}}>
        <div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:"22px",color:T.text,marginBottom:"3px"}}>Club Network</div>
          <Mono size="11px">{filtered.length} of {clubs.length} clubs · {proposals.length} total proposals</Mono>
        </div>
        <Btn onClick={openAdd} small>+ Add Club</Btn>
      </div>
      {showForm&&(
        <Card style={{marginBottom:"14px",borderColor:T.goldDim}}>
          <SL>{editClub?"Edit Club":"New Club"}</SL>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"12px"}}>
            <Inp label="Club Name *" value={form.name} onChange={v=>sf("name",v)} req/>
            <Inp label="League" value={form.league} onChange={v=>sf("league",v)} placeholder="e.g. Premier League"/>
            <Inp label="Country" value={form.country} onChange={v=>sf("country",v)}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"12px"}}>
            <Sel label="Tier" value={form.tier} onChange={v=>sf("tier",v)} options={["Elite","High","Mid","Development","Low"]}/>
            <Inp label="Contact Name" value={form.contactName} onChange={v=>sf("contactName",v)}/>
            <Inp label="Email" value={form.contactEmail} onChange={v=>sf("contactEmail",v)} type="email"/>
            <Inp label="Phone" value={form.contactPhone} onChange={v=>sf("contactPhone",v)}/>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"12px"}}>
            <input type="checkbox" id="mc" checked={!!form.multiClub} onChange={e=>sf("multiClub",e.target.checked)} style={{accentColor:T.gold}}/>
            <label htmlFor="mc" style={{fontFamily:"'Space Mono',monospace",fontSize:"9px",color:T.muted,letterSpacing:"0.12em",textTransform:"uppercase",cursor:"pointer"}}>Multi-Club Ownership Group</label>
          </div>
          <Inp label="Notes" value={form.notes} onChange={v=>sf("notes",v)} multi placeholder="Relationship notes, opportunities, history…"/>
          <div style={{display:"flex",gap:"8px"}}>
            <Btn onClick={saveClub}>Save Club</Btn>
            <Btn onClick={()=>setShowForm(false)} variant="ghost">Cancel</Btn>
          </div>
        </Card>
      )}
      <div style={{display:"flex",gap:"6px",marginBottom:"14px"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search clubs, leagues, countries…"
          style={{flex:1,background:T.panel,border:`1px solid ${T.border}`,borderRadius:"3px",padding:"7px 11px",color:T.text,fontSize:"12px",outline:"none"}}
          onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/>
        <select value={tierF} onChange={e=>setTierF(e.target.value)} style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:"3px",padding:"7px 10px",color:T.text,fontSize:"10px",fontFamily:"'Space Mono',monospace",outline:"none"}}>
          {["All","Elite","High","Mid","Development","Low"].map(o=><option key={o} value={o}>{o}</option>)}
        </select>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:"2px"}}>
        {filtered.map(c=>{
          const clubProps=proposals.filter(pr=>pr.clubId===c.id);
          const clubPlayers=[...new Set(clubProps.map(pr=>pr.playerId))].map(id=>players.find(p=>p.id===id)).filter(Boolean);
          return (
            <Card key={c.id} style={{position:"relative"}}>
              <div style={{position:"absolute",top:"12px",right:"12px",display:"flex",gap:"8px"}}>
                <button onClick={()=>openEdit(c)} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:"9px",letterSpacing:"0.08em"}}>EDIT</button>
                <button onClick={()=>{if(window.confirm("Delete "+c.name+"?"))onDelete(c.id);}} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:"14px",lineHeight:1}}>×</button>
              </div>
              <div style={{marginBottom:"8px",paddingRight:"80px"}}>
                <div style={{fontFamily:"'DM Serif Display',serif",fontSize:"17px",color:T.text,marginBottom:"4px"}}>{c.name}</div>
                <div style={{display:"flex",gap:"6px",flexWrap:"wrap",alignItems:"center"}}>
                  <TierBadge tier={c.tier}/>
                  {c.multiClub&&<Badge color={T.blue} bg={T.blueDim}>Multi-Club</Badge>}
                  {c.league&&<Mono size="9px" color={T.text}>{c.league}</Mono>}
                  {c.country&&<Mono size="9px">· {c.country}</Mono>}
                </div>
              </div>
              {(c.contactName||c.contactEmail||c.contactPhone)&&(
                <div style={{borderTop:`1px solid ${T.border}`,paddingTop:"10px",marginBottom:"10px"}}>
                  {c.contactName&&<div style={{fontSize:"12px",color:T.text,marginBottom:"2px"}}>👤 {c.contactName}</div>}
                  {c.contactEmail&&<div style={{fontSize:"11px",color:T.muted,marginBottom:"2px"}}>✉ {c.contactEmail}</div>}
                  {c.contactPhone&&<div style={{fontSize:"11px",color:T.muted}}>📞 {c.contactPhone}</div>}
                </div>
              )}
              {c.notes&&<p style={{fontSize:"11px",color:T.muted,margin:"0 0 10px",lineHeight:1.5,borderTop:`1px solid ${T.border}`,paddingTop:"8px"}}>{c.notes}</p>}
              {clubPlayers.length>0&&(
                <div style={{borderTop:`1px solid ${T.border}`,paddingTop:"10px"}}>
                  <SL style={{marginBottom:"7px"}}>Players Proposed ({clubPlayers.length})</SL>
                  {clubPlayers.map(p=>{
                    const latest=clubProps.filter(pr=>pr.playerId===p.id).sort((a,b)=>b.date>a.date?1:-1)[0];
                    return (
                      <div key={p.id} onClick={()=>onNav("player",p)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",cursor:"pointer",borderBottom:`1px solid ${T.dim}`}}>
                        <div><span style={{fontSize:"12px",color:T.text}}>{p.name}</span><span style={{fontSize:"10px",color:T.muted,marginLeft:"6px"}}>{p.position}</span></div>
                        {latest&&<PropBadge status={latest.status}/>}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
        {filtered.length===0&&<Card><Mono size="11px">No clubs found. Add your first club to start tracking proposals.</Mono></Card>}
      </div>
    </div>
  );
}

// Consultants View
function ConsultantsView({consultants,onSave,onDelete}) {
  const [show,setShow]=useState(false);
  const [f,setF]=useState({name:"",market:"",role:"Placing & Sourcing",email:"",phone:"",notes:""});
  const sf=(k,v)=>setF(p=>({...p,[k]:v}));
  const save=()=>{if(!f.name.trim())return;onSave({...f,id:uid(),dateAdded:today()});setF({name:"",market:"",role:"Placing & Sourcing",email:"",phone:"",notes:""});setShow(false);};
  return (
    <div style={{animation:"fadeIn 0.3s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"18px"}}>
        <div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:"22px",color:T.text,marginBottom:"3px"}}>Consultant Network</div>
          <Mono size="11px">{consultants.length} contacts · {[...new Set(consultants.map(c=>c.market))].filter(Boolean).length} markets</Mono>
        </div>
        <Btn onClick={()=>setShow(!show)} small>{show?"Cancel":"+ Add Contact"}</Btn>
      </div>
      {show&&(
        <Card style={{marginBottom:"14px",borderColor:T.goldDim}}>
          <SL>New Consultant</SL>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"12px"}}>
            <Inp label="Name *" value={f.name} onChange={v=>sf("name",v)} req/>
            <Inp label="Market" value={f.market} onChange={v=>sf("market",v)} placeholder="e.g. Finland"/>
            <Sel label="Role" value={f.role} onChange={v=>sf("role",v)} options={["Placing","Sourcing","Placing & Sourcing"]}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
            <Inp label="Email" value={f.email} onChange={v=>sf("email",v)} type="email"/>
            <Inp label="Phone" value={f.phone} onChange={v=>sf("phone",v)}/>
          </div>
          <Inp label="Notes" value={f.notes} onChange={v=>sf("notes",v)} multi/>
          <Btn onClick={save}>Save Contact</Btn>
        </Card>
      )}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:"2px"}}>
        {consultants.map(c=>(
          <Card key={c.id} style={{position:"relative"}}>
            <button onClick={()=>{if(window.confirm("Delete "+c.name+"?"))onDelete(c.id);}} style={{position:"absolute",top:"12px",right:"12px",background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:"14px",lineHeight:1}}>×</button>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:"17px",color:T.text,marginBottom:"5px",paddingRight:"24px"}}>{c.name}</div>
            <div style={{display:"flex",gap:"6px",marginBottom:"10px",flexWrap:"wrap"}}>
              {c.market&&<Badge>{c.market}</Badge>}
              <Badge color={T.gold} bg={T.goldDim}>{c.role}</Badge>
            </div>
            {(c.email||c.phone)&&<div style={{marginBottom:"8px"}}>{c.email&&<div style={{fontSize:"11px",color:T.muted,marginBottom:"2px"}}>✉ {c.email}</div>}{c.phone&&<div style={{fontSize:"11px",color:T.muted}}>📞 {c.phone}</div>}</div>}
            {c.notes&&<p style={{fontSize:"11px",color:T.muted,margin:0,lineHeight:1.5,borderTop:`1px solid ${T.border}`,paddingTop:"8px"}}>{c.notes}</p>}
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── WhatsApp Share Modal ─────────────────────────────────────────────────────
function ShareModal({player,onClose}) {
  const [copied,setCopied]=useState(false);
  const [copiedLink,setCopiedLink]=useState(false);
  const [showText,setShowText]=useState(false);
  const verdict=player.recommendation?.verdict;
  const vc={SIGN:{c:T.green,bg:T.greenDim},MONITOR:{c:T.amber,bg:T.amberDim},PASS:{c:T.red,bg:T.redDim}}[verdict]||{c:T.muted,bg:T.dim};
  const avg=player.technical&&player.tactical&&player.physical&&player.mental?((player.technical.score+player.tactical.score+player.physical.score+player.mental.score)/4).toFixed(1):null;

  const buildText=()=>{
    const lines=[];
    lines.push(`*1863 PLAYER PROFILE*`);
    lines.push(`━━━━━━━━━━━━━━━━━`);
    lines.push(`*${player.name}*`);
    lines.push(`${player.position} · ${player.currentClub}`);
    lines.push(`${player.nationality} · DOB: ${player.dob}`);
    lines.push(``);
    if(player.foot||player.height||player.weight) lines.push(`📏 ${[player.height,player.weight].filter(Boolean).join(' / ')}  |  ⚽ ${player.foot} foot`);
    if(player.international) lines.push(`🌍 ${player.international}`);
    if(player.contractExpiry) lines.push(`📅 Contract: ${player.contractExpiry}`);
    if(player.transferFee) lines.push(`💰 Fee: ${player.transferFee}`);
    lines.push(``);
    if(player.description){lines.push(`*DESCRIPTION*`);lines.push(player.description);lines.push(``);}
    if(player.videoUrl){lines.push(`▶️ *VIDEO HIGHLIGHTS*`);lines.push(player.videoUrl);}
    if(player.transfermarktUrl){lines.push(`📊 *TRANSFERMARKT*`);lines.push(player.transfermarktUrl);}
    lines.push(``);
    lines.push(`_Prepared by 1863 Sports & Entertainment · ${today()}_`);
    return lines.join('\n');
  };

  // Robust clipboard copy — tries modern API, falls back to execCommand
  const robustCopy=(text,onDone)=>{
    const doFallback=()=>{
      try{
        const ta=document.createElement('textarea');
        ta.value=text;
        ta.style.cssText='position:fixed;top:0;left:0;opacity:0;pointer-events:none;';
        document.body.appendChild(ta);
        ta.focus();ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        onDone(true);
      }catch{onDone(false);}
    };
    if(navigator.clipboard&&window.isSecureContext){
      navigator.clipboard.writeText(text).then(()=>onDone(true)).catch(doFallback);
    } else { doFallback(); }
  };

  const copyText=()=>robustCopy(buildText(),(ok)=>{if(ok){setCopied(true);setTimeout(()=>setCopied(false),3000);}else{setShowText(true);}});
  const copyVideoLink=()=>{if(!player.videoUrl)return;robustCopy(player.videoUrl,(ok)=>{if(ok){setCopiedLink(true);setTimeout(()=>setCopiedLink(false),3000);}});};

  const barW=(score)=>`${score*10}%`;
  const barC=(score)=>score>=8?T.green:score>=6?T.amber:T.red;
  const fullText=buildText();

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"20px",backdropFilter:"blur(4px)"}} onClick={onClose}>
      <div style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:"6px",width:"100%",maxWidth:"540px",maxHeight:"92vh",overflowY:"auto",animation:"slideUp 0.25s ease"}} onClick={e=>e.stopPropagation()}>

        {/* Card Preview */}
        <div style={{background:"#0a0805",padding:"24px 26px 20px",borderBottom:`1px solid ${T.border}`}}>
          {/* Brand header */}
          <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"16px",paddingBottom:"14px",borderBottom:`1px solid ${T.border}`}}>
            <Logo1863 size={36} dark={false}/>
            <div>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:"7px",color:T.muted,letterSpacing:"0.2em"}}>STRICTLY PRIVATE & CONFIDENTIAL</div>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:"8px",color:T.gold,letterSpacing:"0.15em",marginTop:"2px"}}>PLAYER PROFILE · {today()}</div>
            </div>
          </div>
          {/* Player header */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"14px"}}>
            <div>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:"22px",color:T.gold,marginBottom:"5px"}}>{player.name}</div>
              <div style={{display:"flex",gap:"8px",alignItems:"center",flexWrap:"wrap"}}>
                <PBadge pos={player.position}/>
                <Mono size="11px" color={T.text}>{player.currentClub}</Mono>
                <Mono size="11px">·</Mono>
                <Mono size="11px" color={T.text}>{player.nationality}</Mono>
              </div>
            </div>
            {verdict&&player.status!=="Signed"&&(
              <div style={{background:vc.bg,borderRadius:"3px",padding:"8px 14px",textAlign:"center",flexShrink:0}}>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:"13px",fontWeight:700,color:vc.c,letterSpacing:"0.14em"}}>{verdict}</div>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:"8px",color:T.muted,marginTop:"2px"}}>{player.recommendation?.priority}</div>
              </div>
            )}
          </div>
          {/* Stats */}
          <div style={{display:"flex",gap:"14px",flexWrap:"wrap",marginBottom:"12px",paddingBottom:"12px",borderBottom:`1px solid ${T.border}`}}>
            {[[player.dob,"DOB"],[`${[player.height,player.weight].filter(Boolean).join('/')||"—"}`,"HT/WT"],[player.foot,"FOOT"],[player.international,"INTL"],[player.contractExpiry,"CONTRACT"],[player.transferFee,"FEE"]].filter(([v])=>v&&v!=="—").map(([v,l])=>(
              <div key={l}><div style={{fontFamily:"'Space Mono',monospace",fontSize:"7px",color:T.muted,letterSpacing:"0.15em",marginBottom:"2px"}}>{l}</div><div style={{fontSize:"11px",color:T.text}}>{v}</div></div>
            ))}
          </div>
          {player.description&&<p style={{fontSize:"12px",lineHeight:1.7,color:"#9a9aaa",margin:"0 0 12px"}}>{player.description}</p>}
          {/* Links */}
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
            {player.videoUrl&&<a href={player.videoUrl} target="_blank" rel="noopener" style={{display:"inline-flex",alignItems:"center",gap:"5px",padding:"6px 11px",background:T.greenDim,border:`1px solid ${T.greenBorder}`,borderRadius:"3px",color:T.green,fontSize:"9px",fontFamily:"'Space Mono',monospace",letterSpacing:"0.08em",textDecoration:"none"}}>▶ VIDEO HIGHLIGHTS</a>}
            {player.transfermarktUrl&&<a href={player.transfermarktUrl} target="_blank" rel="noopener" style={{display:"inline-flex",alignItems:"center",gap:"5px",padding:"6px 11px",background:T.dim,border:`1px solid ${T.border}`,borderRadius:"3px",color:T.muted,fontSize:"9px",fontFamily:"'Space Mono',monospace",letterSpacing:"0.08em",textDecoration:"none"}}>📊 TRANSFERMARKT</a>}
          </div>
        </div>

        {/* Actions */}
        <div style={{padding:"18px 22px"}}>
          <SL>Share this profile</SL>
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            <button onClick={copyText} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:T.greenDim,border:`1px solid ${T.greenBorder}`,borderRadius:"3px",padding:"11px 14px",cursor:"pointer"}}>
              <div style={{textAlign:"left"}}>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:"10px",color:T.green,letterSpacing:"0.1em",marginBottom:"2px"}}>📋 COPY FULL PROFILE</div>
                <div style={{fontSize:"11px",color:T.muted}}>Paste directly into WhatsApp, email or any chat</div>
              </div>
              {copied&&<Badge color={T.green} bg={T.greenDim}>✓ Copied!</Badge>}
            </button>
            {player.videoUrl&&(
              <button onClick={copyVideoLink} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:T.blueDim,border:`1px solid #1e3a5f`,borderRadius:"3px",padding:"11px 14px",cursor:"pointer"}}>
                <div style={{textAlign:"left"}}>
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:"10px",color:T.blue,letterSpacing:"0.1em",marginBottom:"2px"}}>▶ COPY VIDEO LINK ONLY</div>
                  <div style={{fontSize:"11px",color:T.muted}}>Just the highlights link</div>
                </div>
                {copiedLink&&<Badge color={T.blue} bg={T.blueDim}>✓ Copied!</Badge>}
              </button>
            )}
            {/* Always visible manual select area */}
            <div style={{background:T.dim,border:`1px solid ${T.border}`,borderRadius:"3px",overflow:"hidden"}}>
              <button onClick={()=>setShowText(!showText)} style={{width:"100%",background:"none",border:"none",padding:"9px 14px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:"10px",color:T.muted,letterSpacing:"0.1em"}}>✎ SELECT & COPY MANUALLY</div>
                <Mono size="9px">{showText?"▲ hide":"▼ show"}</Mono>
              </button>
              {showText&&(
                <textarea readOnly value={fullText} rows={12}
                  style={{width:"100%",background:"#060403",border:"none",borderTop:`1px solid ${T.border}`,padding:"10px 12px",color:T.text,fontSize:"11px",fontFamily:"monospace",resize:"vertical",outline:"none",lineHeight:1.6}}
                  onClick={e=>e.target.select()}
                />
              )}
              {showText&&<div style={{padding:"7px 14px 9px"}}><Mono size="9px">Click inside the box → Ctrl/Cmd+A → Ctrl/Cmd+C to copy all</Mono></div>}
            </div>
          </div>
          <div style={{marginTop:"14px",display:"flex",justifyContent:"flex-end"}}>
            <Btn onClick={onClose} variant="ghost" small>Close</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
// Login Screen — no useState above conditional, it's its own component
// ─── Weekly Report ─────────────────────────────────────────────────────────
function WeeklyReportView({players}) {
  const signed=players.filter(p=>p.status==="Signed"||p.source==="1863 Player");
  const [selected,setSelected]=useState(signed.map(p=>p.id));
  const [loading,setLoading]=useState(false);
  const [report,setReport]=useState(null);
  const [emailText,setEmailText]=useState(null);
  const [error,setError]=useState(null);
  const [copied,setCopied]=useState(false);
  const [showEmail,setShowEmail]=useState(false);

  const toggle=(id)=>setSelected(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  const selectedPlayers=players.filter(p=>selected.includes(p.id));

  const weekStr=()=>{
    const d=new Date();
    const mon=new Date(d);mon.setDate(d.getDate()-d.getDay()+1);
    const sun=new Date(mon);sun.setDate(mon.getDate()+6);
    return `${mon.toLocaleDateString('en-GB',{day:'2-digit',month:'short'})} – ${sun.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}`;
  };

  const run=async()=>{
    if(selectedPlayers.length===0)return;
    setLoading(true);setReport(null);setError(null);setEmailText(null);
    const playerList=selectedPlayers.map(p=>`- ${p.name} (${p.position}, ${p.currentClub}, ${p.nationality})`).join('\n');
    const sys=`You are a football analyst producing a weekly performance briefing for 1863 Sports & Entertainment, a boutique football agency. 

Search for recent match performances, ratings, goals, assists, and news for each player listed. Use sources including Sofascore, Fotmob, BBC Sport, Guardian, Sky Sports, transfermarkt news, and any club or national team news from the past 7 days.

For each player produce a structured JSON object. Your ENTIRE response must be ONE valid JSON array. No markdown, no text outside the JSON.

Format:
[
  {
    "name": "Player Name",
    "club": "Current Club",
    "position": "Position",
    "weekSummary": "2-3 sentence narrative of their week — matches played, standout moments, any news",
    "rating": "Sofascore or Fotmob rating if found (e.g. 7.4) or null",
    "goals": 0,
    "assists": 0,
    "minutesPlayed": 0,
    "keyStats": "e.g. 4 saves, 2 key passes, 87% pass accuracy — pull whatever is most relevant for their position",
    "matchResult": "e.g. Hearts 2-1 Rangers (W)",
    "news": "Any transfer news, injury news, international call-ups or notable headlines this week",
    "sentiment": "positive|neutral|negative",
    "flagged": true or false (flag if there is significant news, injury, or transfer speculation worth immediate attention)
  }
]`;

    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:4000,system:sys,
          tools:[{type:"web_search_20250305",name:"web_search"}],
          messages:[{role:"user",content:`Generate the weekly performance report for the week of ${weekStr()} for these 1863 players:\n\n${playerList}\n\nSearch for each player's recent performances, ratings and news.`}]})});
      const data=await res.json();
      if(data.error)throw new Error(data.error.message||"API error");
      // Web search returns multiple content blocks — get ALL text blocks and use the last (final) one
      const textBlocks=(data.content||[]).filter(b=>b.type==="text");
      if(textBlocks.length===0)throw new Error("No text response from API");
      const rawText=textBlocks[textBlocks.length-1].text;
      let c=rawText.replace(/```json\s*/gi,"").replace(/```\s*/g,"").trim();
      let arr;
      try{arr=JSON.parse(c);}catch{
        const m=c.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if(m){try{arr=JSON.parse(m[0]);}catch(e2){throw new Error("Could not parse report JSON: "+e2.message);}}
        else throw new Error("Report generation failed — no JSON array in response. Try with fewer players.");
      }
      if(!Array.isArray(arr))throw new Error("Unexpected response format");
      setReport(arr);
      buildEmail(arr);
    }catch(e){setError(e.message||"Failed to generate report");}
    setLoading(false);
  };

  const REPORT_EMAIL="james@18sixtythree.com";
  const buildEmail=(arr)=>{
    const flagged=arr.filter(p=>p.flagged);
    const lines=[];
    lines.push(`Subject: 1863 Weekly Player Report — ${weekStr()}`);
    lines.push(`To: ${REPORT_EMAIL}`);
    lines.push('');
    lines.push('Hi James,');
    lines.push('');
    lines.push(`Here is the weekly performance update for our players for the week of ${weekStr()}.`);
    lines.push('');
    if(flagged.length>0){
      lines.push('⚡ ITEMS REQUIRING IMMEDIATE ATTENTION');
      lines.push('─────────────────────────────────────');
      flagged.forEach(p=>{
        lines.push(`• ${p.name} (${p.club}) — ${p.news||p.weekSummary}`);
      });
      lines.push('');
    }
    lines.push('PLAYER PERFORMANCES');
    lines.push('─────────────────────────────────────');
    arr.forEach(p=>{
      const sent=p.sentiment==='positive'?'📈':p.sentiment==='negative'?'📉':'➡️';
      lines.push(`${sent} ${p.name} — ${p.club}`);
      if(p.matchResult)lines.push(`   Result: ${p.matchResult}`);
      if(p.rating)lines.push(`   Rating: ${p.rating}/10`);
      const stats=[];
      if(p.goals)stats.push(`${p.goals} goal${p.goals>1?'s':''}`);
      if(p.assists)stats.push(`${p.assists} assist${p.assists>1?'s':''}`);
      if(p.minutesPlayed)stats.push(`${p.minutesPlayed} mins`);
      if(stats.length>0)lines.push(`   Stats: ${stats.join(' · ')}`);
      if(p.keyStats)lines.push(`   ${p.keyStats}`);
      lines.push(`   ${p.weekSummary}`);
      if(p.news)lines.push(`   📰 ${p.news}`);
      lines.push('');
    });
    lines.push('─────────────────────────────────────');
    lines.push('Report generated by 1863 Intelligence Platform.');
    lines.push('STRICTLY PRIVATE & CONFIDENTIAL');
    setEmailText(lines.join('\n'));
  };

  const robustCopy=(text,cb)=>{
    const fb=()=>{try{const ta=document.createElement('textarea');ta.value=text;ta.style.cssText='position:fixed;opacity:0;';document.body.appendChild(ta);ta.focus();ta.select();document.execCommand('copy');document.body.removeChild(ta);cb(true);}catch{cb(false);}};
    if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(text).then(()=>cb(true)).catch(fb);
    else fb();
  };

  const sentColor=(s)=>s==='positive'?T.green:s==='negative'?T.red:T.muted;
  const sentIcon=(s)=>s==='positive'?'📈':s==='negative'?'📉':'➡️';

  return (
    <div style={{animation:"fadeIn 0.3s ease"}}>
      <div style={{marginBottom:"22px"}}>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:"22px",color:T.text,marginBottom:"3px"}}>Weekly Report</div>
        <Mono size="11px">AI-powered performance digest from Sofascore, Fotmob, news sources · {weekStr()}</Mono>
      </div>

      {/* Player selection */}
      <Card style={{marginBottom:"12px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
          <SL style={{marginBottom:0}}>Select Players ({selectedPlayers.length}/{players.length})</SL>
          <div style={{display:"flex",gap:"8px"}}>
            <button onClick={()=>setSelected(players.map(p=>p.id))} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:"3px",padding:"4px 9px",color:T.muted,fontSize:"9px",fontFamily:"'Space Mono',monospace",cursor:"pointer",letterSpacing:"0.07em"}}>ALL</button>
            <button onClick={()=>setSelected(signed.map(p=>p.id))} style={{background:"none",border:`1px solid ${T.gold}`,borderRadius:"3px",padding:"4px 9px",color:T.gold,fontSize:"9px",fontFamily:"'Space Mono',monospace",cursor:"pointer",letterSpacing:"0.07em"}}>SIGNED</button>
            <button onClick={()=>setSelected([])} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:"3px",padding:"4px 9px",color:T.muted,fontSize:"9px",fontFamily:"'Space Mono',monospace",cursor:"pointer",letterSpacing:"0.07em"}}>NONE</button>
          </div>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
          {players.filter(p=>p.name).map(p=>{
            const sel=selected.includes(p.id);
            return (
              <button key={p.id} onClick={()=>toggle(p.id)} style={{display:"flex",alignItems:"center",gap:"5px",padding:"5px 10px",borderRadius:"3px",border:`1px solid ${sel?T.gold:T.border}`,background:sel?T.goldDim:T.dim,cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:"9px",color:sel?T.gold:T.muted,letterSpacing:"0.06em",transition:"all 0.12s"}}>
                <PBadge pos={p.position} small/>{p.name}
              </button>
            );
          })}
        </div>
        <div style={{marginTop:"14px"}}>
          <Btn onClick={run} disabled={loading||selectedPlayers.length===0} fullWidth={false}>
            {loading?`⟳ Searching news & ratings for ${selectedPlayers.length} players…`:`→ Generate Weekly Report (${selectedPlayers.length} players)`}
          </Btn>
        </div>
      </Card>

      {error&&<Card style={{borderColor:T.redBorder,background:T.redDim,marginBottom:"12px"}}><Mono color={T.red}>Error: {error}</Mono></Card>}

      {report&&!loading&&(
        <div style={{animation:"slideUp 0.3s ease"}}>
          {/* Flagged items */}
          {report.filter(p=>p.flagged).length>0&&(
            <Card style={{borderColor:T.amberBorder,background:T.amberDim,marginBottom:"12px"}}>
              <SL style={{color:T.amber}}>⚡ Requires Attention</SL>
              {report.filter(p=>p.flagged).map(p=>(
                <div key={p.name} style={{padding:"8px 0",borderBottom:`1px solid ${T.amberBorder}`}}>
                  <div style={{fontSize:"13px",color:T.amber,fontWeight:500,marginBottom:"2px"}}>{p.name} · {p.club}</div>
                  <p style={{fontSize:"12px",color:T.text,margin:0,lineHeight:1.5}}>{p.news||p.weekSummary}</p>
                </div>
              ))}
            </Card>
          )}

          {/* Player cards grid */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:"2px",marginBottom:"12px"}}>
            {report.map((p,i)=>(
              <Card key={i} style={{borderLeft:`3px solid ${sentColor(p.sentiment)}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px"}}>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:"7px",marginBottom:"3px"}}>
                      <span style={{fontSize:"14px"}}>{sentIcon(p.sentiment)}</span>
                      <span style={{fontFamily:"'DM Serif Display',serif",fontSize:"16px",color:T.gold}}>{p.name}</span>
                    </div>
                    <Mono size="10px" color={T.text}>{p.club} · {p.position}</Mono>
                  </div>
                  {p.rating&&(
                    <div style={{background:T.dim,border:`1px solid ${T.border}`,borderRadius:"3px",padding:"5px 10px",textAlign:"center"}}>
                      <Mono size="7px" color={T.muted}>RATING</Mono>
                      <div style={{fontFamily:"'Space Mono',monospace",fontSize:"18px",color:parseFloat(p.rating)>=7.5?T.green:parseFloat(p.rating)>=6?T.amber:T.red,lineHeight:1.1}}>{p.rating}</div>
                    </div>
                  )}
                </div>
                {p.matchResult&&<div style={{fontSize:"11px",color:T.text,background:T.bg,borderRadius:"3px",padding:"4px 8px",marginBottom:"8px",fontFamily:"'Space Mono',monospace"}}>{p.matchResult}</div>}
                <div style={{display:"flex",gap:"8px",marginBottom:"8px",flexWrap:"wrap"}}>
                  {p.goals>0&&<Badge color={T.green} bg={T.greenDim}>{p.goals} goal{p.goals>1?'s':''}</Badge>}
                  {p.assists>0&&<Badge color={T.blue} bg={T.blueDim}>{p.assists} assist{p.assists>1?'s':''}</Badge>}
                  {p.minutesPlayed>0&&<Badge>{p.minutesPlayed}'</Badge>}
                </div>
                {p.keyStats&&<Mono size="10px" color={T.text} style={{marginBottom:"7px",display:"block"}}>{p.keyStats}</Mono>}
                <p style={{fontSize:"12px",color:T.muted,margin:"0 0 6px",lineHeight:1.55}}>{p.weekSummary}</p>
                {p.news&&<p style={{fontSize:"11px",color:T.amber,margin:0,lineHeight:1.4,borderTop:`1px solid ${T.border}`,paddingTop:"7px"}}>📰 {p.news}</p>}
              </Card>
            ))}
          </div>

          {/* Email draft */}
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
              <SL style={{marginBottom:0}}>Weekly Email Draft</SL>
              <div style={{display:"flex",gap:"8px"}}>
                <button onClick={()=>setShowEmail(!showEmail)} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:"3px",padding:"5px 10px",color:T.muted,fontSize:"9px",fontFamily:"'Space Mono',monospace",cursor:"pointer",letterSpacing:"0.07em"}}>{showEmail?"HIDE":"SHOW"} DRAFT</button>
                <button onClick={()=>robustCopy(emailText||"",(ok)=>{if(ok){setCopied(true);setTimeout(()=>setCopied(false),3000);}})} style={{background:T.greenDim,border:`1px solid ${T.greenBorder}`,borderRadius:"3px",padding:"5px 10px",color:T.green,fontSize:"9px",fontFamily:"'Space Mono',monospace",cursor:"pointer",letterSpacing:"0.07em"}}>{copied?"✓ COPIED":"📋 COPY EMAIL"}</button>
                <a href={`mailto:${REPORT_EMAIL}?subject=${encodeURIComponent("1863 Weekly Player Report — "+weekStr())}&body=${encodeURIComponent(emailText||"")}`} style={{background:T.goldDim,border:`1px solid ${T.gold}`,borderRadius:"3px",padding:"5px 10px",color:T.gold,fontSize:"9px",fontFamily:"'Space Mono',monospace",cursor:"pointer",letterSpacing:"0.07em",textDecoration:"none",display:"inline-flex",alignItems:"center"}}>✉ OPEN IN MAIL</a>
              </div>
            </div>
            <p style={{fontSize:"12px",color:T.muted,margin:"0 0 10px",lineHeight:1.5}}>To: <span style={{color:T.gold,fontFamily:"monospace"}}>{REPORT_EMAIL}</span> — Includes flagged items, performance summaries and news for all {report.length} players.</p>
            {showEmail&&emailText&&<textarea readOnly value={emailText} rows={20} style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:"3px",padding:"12px",color:T.text,fontSize:"11px",fontFamily:"monospace",resize:"vertical",outline:"none",lineHeight:1.6,boxSizing:"border-box"}} onClick={e=>e.target.select()}/>}
          </Card>
        </div>
      )}
    </div>
  );
}

function LoginScreen({onLogin}) {
  const [name,setName]=useState("");
  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",padding:"24px"}}>
      <div style={{marginBottom:"8px"}}><Logo1863 size={100} dark={false}/></div>
      <Mono size="9px" style={{marginBottom:"48px",letterSpacing:"0.22em",textTransform:"uppercase"}}>Intelligence Platform</Mono>
      <div style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:"4px",padding:"32px 36px",width:"100%",maxWidth:"360px"}}>
        <SL style={{textAlign:"center",marginBottom:"16px"}}>Who are you?</SL>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your name or initials"
          onKeyDown={e=>e.key==="Enter"&&name.trim()&&onLogin(name.trim())}
          autoFocus style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:"3px",padding:"11px",color:T.text,fontSize:"14px",fontFamily:"'DM Sans',sans-serif",outline:"none",textAlign:"center",marginBottom:"14px"}}
          onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/>
        <Btn onClick={()=>name.trim()&&onLogin(name.trim())} disabled={!name.trim()} fullWidth>Enter Platform</Btn>
        <p style={{fontSize:"9px",color:T.muted,textAlign:"center",marginTop:"14px",lineHeight:1.6,fontFamily:"'Space Mono',monospace"}}>Shared database — all team members see the same data in real time.</p>
      </div>
    </div>
  );
}

// Root App — all hooks at top level, no conditionals
const NAV=[{id:"dashboard",icon:"◈",label:"Dashboard"},{id:"players",icon:"◉",label:"Players"},{id:"portfolio",icon:"★",label:"Portfolio"},{id:"scout",icon:"⚡",label:"AI Scout"},{id:"recommend",icon:"⬡",label:"Club Finder"},{id:"report",icon:"✉",label:"Weekly Report"},{id:"clubs",icon:"◫",label:"Clubs"},{id:"consultants",icon:"◎",label:"Network"},{id:"archive",icon:"◻",label:"Archive"}];

// Bump version key to force reseed with new player/club data from CSV imports
const SK_V="v7";
const SK={players:`1863_${SK_V}:players`,consultants:`1863_${SK_V}:consultants`,clubs:`1863_${SK_V}:clubs`,proposals:`1863_${SK_V}:proposals`,user:`1863_v3:user`};

export default function App() {
  const { role, profile } = useRole();
  const isAdmin = role === "admin";
  const canEdit = role === "admin" || role === "standard";
  const [showUserMgmt,setShowUserMgmt]=useState(false);
  const handleSignOut = async () => { await supabase.auth.signOut(); };
  const [currentUser,setCurrentUser]=useState(null);
  const [players,setPlayers]=useState([]);
  const [consultants,setConsultants]=useState([]);
  const [clubs,setClubs]=useState([]);
  const [proposals,setProposals]=useState([]);
  const [view,setView]=useState("dashboard");
  const [selectedPlayerId,setSelectedPlayerId]=useState(null);
  const [editingPlayer,setEditingPlayer]=useState(null);
  const [booting,setBooting]=useState(true);

  useEffect(()=>{
    (async()=>{
      const [u,p,c,cl,pr]=await Promise.all([sGet(SK.user),sGet(SK.players),sGet(SK.consultants),sGet(SK.clubs),sGet(SK.proposals)]);
      if(u)setCurrentUser(u);
      if(p&&p.length>0)setPlayers(p);else{setPlayers(SEED_PLAYERS);sSet(SK.players,SEED_PLAYERS);}
      if(c&&c.length>0)setConsultants(c);else{setConsultants(SEED_CONSULTANTS);sSet(SK.consultants,SEED_CONSULTANTS);}
      if(cl&&cl.length>0)setClubs(cl);else{setClubs(SEED_CLUBS);sSet(SK.clubs,SEED_CLUBS);}
      setProposals(pr&&pr.length>0?pr:[]);
      setBooting(false);
    })();
  },[]);

  const login=useCallback(async(name)=>{setCurrentUser(name);sSet(SK.user,name);},[]);
  const savePlayer=useCallback(async(player)=>{setPlayers(prev=>{const e=prev.find(p=>p.id===player.id);const next=e?prev.map(p=>p.id===player.id?player:p):[...prev,player];sSet(SK.players,next);return next;});setView("players");setEditingPlayer(null);setSelectedPlayerId(null);},[]);
  const deletePlayer=useCallback(async(id)=>{setPlayers(prev=>{const next=prev.filter(p=>p.id!==id);sSet(SK.players,next);return next;});},[]);
  const archivePlayer=useCallback(async(id)=>{setPlayers(prev=>{const next=prev.map(p=>p.id===id?{...p,archived:!p.archived,archivedDate:!p.archived?today():undefined}:p);sSet(SK.players,next);return next;});},[]);
  const saveConsultant=useCallback(async(c)=>{setConsultants(prev=>{const next=[...prev,c];sSet(SK.consultants,next);return next;});},[]);
  const deleteConsultant=useCallback(async(id)=>{setConsultants(prev=>{const next=prev.filter(c=>c.id!==id);sSet(SK.consultants,next);return next;});},[]);
  const saveClub=useCallback(async(cl)=>{setClubs(prev=>{const e=prev.find(c=>c.id===cl.id);const next=e?prev.map(c=>c.id===cl.id?cl:c):[...prev,cl];sSet(SK.clubs,next);return next;});},[]);
  const deleteClub=useCallback(async(id)=>{setClubs(prev=>{const next=prev.filter(c=>c.id!==id);sSet(SK.clubs,next);return next;});},[]);
  const addProposal=useCallback(async(pr)=>{const p={...pr,addedBy:currentUser||"Team"};setProposals(prev=>{const next=[...prev,p];sSet(SK.proposals,next);return next;});},[currentUser]);

  const nav=useCallback((v,data=null)=>{
    setView(v);
    if(v==="player"&&data){setSelectedPlayerId(data.id||null);}
    if(v==="add-player"){setEditingPlayer(null);}
    if(v!=="player"){setSelectedPlayerId(null);}
  },[]);

  const isPlayersActive=view==="players"||view==="player"||view==="add-player";
  const currentPlayer=selectedPlayerId?players.find(p=>p.id===selectedPlayerId)||null:null;

  if(booting)return(<div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center"}}><style>{css}</style><Mono color={T.gold} size="11px">Loading 1863 platform…</Mono></div>);
  if(!currentUser)return(<><style>{css}</style><LoginScreen onLogin={login}/></>);

  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",fontFamily:"'DM Sans',sans-serif",color:T.text}}>
      <style>{css}</style>
      <div style={{width:"188px",flexShrink:0,background:T.panel,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",position:"sticky",top:0,height:"100vh",overflowY:"auto"}}>
        <div style={{padding:"16px 14px 12px",display:"flex",alignItems:"center",gap:"10px"}}>
          <LogoMark size={42} dark={false}/>
          <div>
            <div style={{fontFamily:"'Barlow',sans-serif",fontWeight:900,fontSize:"11px",letterSpacing:"0.18em",color:"#e8edf0",lineHeight:1.1}}>EIGHTEEN</div>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:"7px",color:"#4a6475",letterSpacing:"0.14em",marginTop:"3px",lineHeight:1.3}}>INTELLIGENCE<br/>PLATFORM</div>
          </div>
        </div>
        <div style={{height:"1px",background:T.border,margin:"0 12px"}}/>
        <nav style={{padding:"10px 6px",flex:1}}>
          {NAV.map(item=>{
            const active=item.id==="players"?isPlayersActive:view===item.id;
            return <button key={item.id} onClick={()=>nav(item.id)} style={{display:"flex",alignItems:"center",gap:"9px",width:"100%",padding:"9px 10px",borderRadius:"3px",background:active?T.dim:"transparent",border:"none",cursor:"pointer",color:active?T.text:T.muted,fontFamily:"'Space Mono',monospace",fontSize:"9px",letterSpacing:"0.07em",textTransform:"uppercase",transition:"all 0.12s",marginBottom:"1px",textAlign:"left"}}><span style={{color:active?T.gold:T.muted,fontSize:item.id==="portfolio"?"13px":"11px"}}>{item.icon}</span>{item.label}</button>;
          })}
        </nav>
        <div style={{padding:"12px 16px",borderTop:`1px solid ${T.border}`}}>
          {showUserMgmt&&<UserManagementPanel onClose={()=>setShowUserMgmt(false)}/>}
          <Mono size="8px" style={{marginBottom:"3px"}}>Signed in as</Mono>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:"10px",color:T.text,marginBottom:"2px"}}>{profile?.full_name||currentUser||"—"}</div>
          <Mono size="8px" style={{color:role==="admin"?T.gold:role==="standard"?T.green:T.muted,letterSpacing:"0.1em",display:"block",marginBottom:"8px"}}>{(role||"").toUpperCase()}</Mono>
          {isAdmin&&<button onClick={()=>setShowUserMgmt(true)} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:"3px",padding:"4px 8px",color:T.muted,fontSize:"8px",fontFamily:"'Space Mono',monospace",cursor:"pointer",letterSpacing:"0.08em",display:"block",width:"100%",marginBottom:"5px",textAlign:"center"}}>⚙ MANAGE USERS</button>}
          <button onClick={handleSignOut} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:"8px",letterSpacing:"0.1em",padding:0}}>SIGN OUT</button>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"28px 32px",maxWidth:"1200px"}}>
        {view==="dashboard"&&<Dashboard players={players} consultants={consultants} clubs={clubs} proposals={proposals} onNav={nav}/>}
        {view==="players"&&<PlayersList players={players} onNav={nav} onDelete={canEdit?deletePlayer:null} onArchive={canEdit?archivePlayer:null} canEdit={canEdit}/>}
        {view==="portfolio"&&<PortfolioView players={players} proposals={proposals} clubs={clubs} onNav={nav}/>}
        {view==="report"&&<WeeklyReportView players={players}/>}
        {view==="player"&&currentPlayer&&<PlayerDetail player={currentPlayer} clubs={clubs} proposals={proposals} onBack={()=>{setSelectedPlayerId(null);setView("players");}} onEdit={canEdit?p=>{setEditingPlayer(p);setView("add-player");}:null} onAddProposal={canEdit?addProposal:null} onNav={nav} onArchive={canEdit?archivePlayer:null} canEdit={canEdit} userRole={role}/>}
        {view==="player"&&!currentPlayer&&<div style={{padding:"40px",textAlign:"center"}}><Mono>Player not found. <button onClick={()=>setView("players")} style={{background:"none",border:"none",color:T.gold,cursor:"pointer",fontFamily:"inherit",fontSize:"inherit"}}>Back to list →</button></Mono></div>}
        {view==="add-player"&&<PlayerForm initial={editingPlayer} onSave={savePlayer} onCancel={()=>{if(editingPlayer){setView("player");setSelectedPlayerId(editingPlayer.id);}else setView("players");setEditingPlayer(null);}} currentUser={currentUser}/>}
        {view==="scout"&&<ScoutView onSave={savePlayer} currentUser={currentUser}/>}
        {view==="recommend"&&<ClubRecommender players={players}/>}
        {view==="clubs"&&<ClubsView clubs={clubs} players={players} proposals={proposals} onSave={saveClub} onDelete={deleteClub} onNav={nav}/>}
        {view==="consultants"&&<ConsultantsView consultants={consultants} onSave={saveConsultant} onDelete={deleteConsultant}/>}
        {view==="archive"&&<ArchiveView players={players} onUnarchive={archivePlayer} onNav={nav}/>}
      </div>
    </div>
  );
}
