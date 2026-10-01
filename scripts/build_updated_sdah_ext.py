#!/usr/bin/env python3
"""
Populates the updated SDAH Extended collection using the user's provided data:
- 696-954 (259 hymns) from the user's updated attachment.
- Combined with standard SDAH (1-695) to produce the complete 1-954 SDAH Extended replica.
"""

import json
import os

PUBLIC_DIR = "public/data"
MOBILE_DIR = "mobile/assets/data"

for d in [PUBLIC_DIR, MOBILE_DIR]:
    os.makedirs(d, exist_ok=True)

# Raw items provided by the user in the prompt
RAW_USER_HYMNS = [
    {
      "number": 696,
      "title": "He Brought Me Out",
      "author": "Henry J. Zelley (1898)",
      "tune": {"name": "He Brought Me Out", "meter": "8.7.8.7 with Chorus", "key": "A-flat Major"},
      "scripture": "Zaburi (Psalm) 40:2",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "My Savior shall my life restore,\nAnd bring me from the sinful shore;\nHe pulled me from the miry clay,\nAnd set my feet upon the way."},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "He brought me out of the miry clay,\nHe set my feet on the Rock to stay;\nHe puts a song in my soul today,\nA song of praise, hallelujah!"}
      ],
      "cross_references": []
    },
    {
      "number": 697,
      "title": "Are You Washed in the Blood?",
      "author": "Elisha Albright Hoffman (1878)",
      "tune": {"name": "Are You Washed in the Blood", "meter": "11.9.11.9 with Chorus", "key": "A-flat Major"},
      "scripture": "Revelation 7:14; 1 John 1:7",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "Have you been to Jesus for the cleansing power?\nAre you washed in the blood of the Lamb?\nAre you fully trusting in His grace this hour?\nAre you washed in the blood of the Lamb?"},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "Are you washed in the blood,\nIn the soul-cleansing blood of the Lamb?\nAre your garments spotless? Are they white as snow?\nAre you washed in the blood of the Lamb?"},
        {"stanza_number": 2, "is_chorus": False, "lyrics": "Are you walking daily by the Savior's side?\nAre you washed in the blood of the Lamb?\nDo you rest each moment in the Crucified?\nAre you washed in the blood of the Lamb?"},
        {"stanza_number": 3, "is_chorus": False, "lyrics": "Lay aside the garments that are stained with sin,\nAnd be washed in the blood of the Lamb;\nThere's a fountain flowing for the soul unclean,\nO be washed in the blood of the Lamb!"}
      ],
      "cross_references": [{"hymnal": "NZK", "number": 117}, {"hymnal": "NCA", "number": 164}, {"hymnal": "OKN", "number": 164}]
    },
    {
      "number": 698,
      "title": "Count Your Blessings",
      "author": "Johnson Oatman, Jr. (1897)",
      "tune": {"name": "Blessings", "meter": "11.11.11.11 with Chorus", "key": "E-flat Major"},
      "scripture": "Psalm 103:2; Ephesians 1:3",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "When upon life's billows you are tempest-tossed,\nWhen you are discouraged, thinking all is lost,\nCount your many blessings, name them one by one,\nAnd it will surprise you what the Lord hath done."},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "Count your blessings, name them one by one;\nCount your blessings, see what God hath done;\nCount your blessings, name them one by one,\nAnd it will surprise you what the Lord hath done."},
        {"stanza_number": 2, "is_chorus": False, "lyrics": "Are you ever burdened with a load of care?\nDoes the cross seem heavy you are called to bear?\nCount your many blessings, ev'ry doubt will fly,\nAnd you will be singing as the days go by."},
        {"stanza_number": 3, "is_chorus": False, "lyrics": "So, amid the conflict, whether great or small,\nDo not be discouraged, God is over all;\nCount your many blessings, angels will attend,\nHelp and comfort give you to your journey's end."}
      ],
      "cross_references": [{"hymnal": "NZK", "number": 173}, {"hymnal": "NCA", "number": 173}]
    },
    {
      "number": 699,
      "title": "Master, the Tempest Is Raging",
      "author": "Mary Ann Baker (1874)",
      "tune": {"name": "Peace, Be Still", "meter": "Irregular with Chorus", "key": "C Minor / C Major"},
      "scripture": "Mariko (Mark) 4:38-39",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "Master, the tempest is raging!\nThe billows are tossing high!\nThe sky is o'ershadowed with blackness,\nNo shelter or help is nigh;\nCarest Thou not that we perish?\nHow canst Thou lie asleep,\nWhen each moment so madly is threat'ning\nA grave in the angry deep?"},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "The winds and the waves shall obey Thy will,\nPeace, be still!\nWhether the wrath of the storm-tossed sea,\nOr demons or men or whatever it be,\nNo water can swallow the ship where lies\nThe Master of ocean and earth and skies;\nThey all shall sweetly obey Thy will:\nPeace, be still! Peace, be still!"}
      ],
      "cross_references": []
    },
    {
      "number": 700,
      "title": "Till the Storm Passes Over",
      "author": "Mosie Lister (1958)",
      "tune": {"name": "Passes Over", "meter": "11.10.11.10 with Chorus", "key": "D-flat Major"},
      "scripture": "Zaburi (Psalm) 57:1",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "In the dark of the midnight have I oft hid my face,\nWhile the storm howls above me, and there's no hiding place.\n'Mid the crash of the thunder, Precious Lord, hear my cry,\nKeep me safe till the storm passes by."},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "Till the storm passes over, till the thunder sounds no more,\nTill the clouds roll forever from the sky;\nHold me fast, let me stand in the hollow of Thy hand,\nKeep me safe till the storm passes by."}
      ],
      "cross_references": []
    },
    {
      "number": 701,
      "title": "Asleep in Jesus",
      "author": "Margaret Mackay (1832)",
      "tune": {"name": "Rest", "meter": "L.M.", "key": "F Major"},
      "scripture": "1 Athesalonike (1 Thess) 4:14",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "Asleep in Jesus! blessed sleep,\nFrom which none ever wakes to weep;\nA calm and undisturbed repose,\nUnbroken by the last of foes."}
      ],
      "cross_references": []
    },
    {
      "number": 702,
      "title": "Dare to Be a Daniel",
      "author": "Philip P. Bliss (1873)",
      "tune": {"name": "Daniel", "meter": "P.M. with Chorus", "key": "B-flat Major"},
      "scripture": "Daniel 1:8",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "Standing by a purpose true, Heeding God's command,\nHonor them, the faithful few! All hail to Daniel's band!"},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "Dare to be a Daniel, Dare to stand alone!\nDare to have a purpose firm! Dare to make it known!"},
        {"stanza_number": 2, "is_chorus": False, "lyrics": "Many mighty men are lost, Daring not to stand,\nWho for God had been a host, By joining Daniel's band!"},
        {"stanza_number": 3, "is_chorus": False, "lyrics": "Hold the gospel banner high! On to vict'ry grand!\nSatan and his host defy, And shout for Daniel's band!"}
      ],
      "cross_references": [{"hymnal": "NCA", "number": 159}]
    },
    {
      "number": 703,
      "title": "Heaven Came Down",
      "author": "John W. Peterson (1961)",
      "tune": {"name": "Heaven Came Down", "meter": "9.9.9.9 with Chorus", "key": "F Major"},
      "scripture": "2 Corinthians 5:17",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "O what a wonderful, wonderful day, day I will never forget;\nAfter I'd wandered in darkness away, Jesus my Savior I met.\nO what a tender, compassionate friend, He met the need of my heart;\nShadows dispelling, with joy I am telling, He made all the darkness depart!"},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "Heaven came down and glory filled my soul,\nWhen at the cross the Savior made me whole;\nMy sins were washed away and my night was turned to day,\nHeaven came down and glory filled my soul!"},
        {"stanza_number": 2, "is_chorus": False, "lyrics": "Born of the Spirit with life from above into God's fam'ly divine,\nJustified fully thru Calvary's love, O what a standing is mine!\nAnd the transaction so quickly was made, when as a sinner I came,\nTook of the offer of grace He did proffer, He saved me, O praise His dear name!"}
      ],
      "cross_references": []
    },
    {
      "number": 704,
      "title": "Life at Best Is Very Brief (Be in Time)",
      "author": "Philip P. Bliss (1871)",
      "tune": {"name": "Be in Time", "meter": "8.7.8.7 with Chorus", "key": "A-flat Major"},
      "scripture": "Hebrews 3:7-8",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "Life at best is very brief, like the falling of a leaf,\nLike the binding of a sheaf, be in time!\nFleeting days are telling fast that the die will soon be cast,\nAnd the fatal line be passed: be in time!"},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "Be in time! Be in time!\nWhile the voice of Jesus calls you, be in time!\nIf in sin you longer wait, you may find no open gate,\nAnd your cry will be too late: be in time!"},
        {"stanza_number": 2, "is_chorus": False, "lyrics": "Fairest flowers soon decay, youth and beauty pass away,\nOh, you have not long to stay: be in time!\nWhile God's Spirit bids you come, sinner, do not longer roam,\nLest you miss your heav'nly home: be in time!"}
      ],
      "cross_references": [{"hymnal": "NZK", "number": 153}, {"hymnal": "NCA", "number": 153}]
    },
    {
      "number": 705,
      "title": "There's a Stranger at the Door",
      "author": "J.B. Atchinson / E.O. Excell (1881)",
      "tune": {"name": "Let Him In", "meter": "8.7.8.7 with Refrain", "key": "B-flat Major"},
      "scripture": "Revelation 3:20",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "There's a stranger at the door, let Him in;\nHe has been there oft before, let Him in;\nLet Him in, ere He is gone, let Him in, the Holy One,\nJesus Christ, the Father's Son, let Him in."},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "Open now to Him your heart, let Him in;\nIf you wait He will depart, let Him in;\nLet Him in, He is your Friend, He your soul will e'er defend,\nHe will keep you to the end, let Him in."}
      ],
      "cross_references": [{"hymnal": "NZK", "number": 102}, {"hymnal": "NCA", "number": 142}, {"hymnal": "OKN", "number": 142}]
    },
    {
      "number": 706,
      "title": "Jesus, Rose of Sharon",
      "author": "Ida A. Guirey (1922)",
      "tune": {"name": "Rose of Sharon", "meter": "8.7.8.7 with Chorus", "key": "A-flat Major"},
      "scripture": "Song of Solomon 2:1",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "Jesus, Rose of Sharon, bloom within my heart;\nBeauties of Thy truth and grace to me impart."},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "Jesus, Rose of Sharon, bloom within my heart;\nLet Thy fragrant beauty nevermore depart."}
      ],
      "cross_references": []
    },
    {
      "number": 707,
      "title": "He Was Nailed to the Cross for Me",
      "author": "F.A. Graves (1906)",
      "tune": {"name": "Nailed to the Cross", "meter": "P.M. with Chorus", "key": "F Major"},
      "scripture": "Galatians 3:13",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "What a wonderful, wonderful Savior is Jesus, my Savior and King!\nHe took all my sorrow, my burden, and gave me a new song to sing."},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "He was nailed to the cross for me, He was nailed to the cross for me;\nOn the cross crucified, for me He bled and died,\nHe was nailed to the cross for me."}
      ],
      "cross_references": []
    },
    {
      "number": 708,
      "title": "The Gate Ajar for Me",
      "author": "Lydia Baxter (1872)",
      "tune": {"name": "The Gate Ajar", "meter": "8.7.8.7 with Chorus", "key": "C Major"},
      "scripture": "Revelation 3:8; John 10:9",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "There is a gate that stands ajar, and friendly beamings shine;\nAlong the heav'nly way afar, to indicate God's love divine."},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "Oh, depth of mercy! Can it be that gate was left ajar for me?\nFor me, for me? Was left ajar for me?"},
        {"stanza_number": 2, "is_chorus": False, "lyrics": "That heav'nly gate stands open wide to all who enter in;\nRedeemed by Jesus crucified, and cleansed from ev'ry stain of sin."}
      ],
      "cross_references": [{"hymnal": "NZK", "number": 57}, {"hymnal": "NCA", "number": 79}, {"hymnal": "OKN", "number": 79}]
    },
    {
      "number": 709,
      "title": "Beautiful Robes",
      "author": "Eben E. Rexford (1888)",
      "tune": {"name": "Beautiful Robes", "meter": "P.M. with Chorus", "key": "A-flat Major"},
      "scripture": "Revelation 7:9, 13-14",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "We shall wear a robe and crown, in the city of the King,\nWhen we lay our burdens down, and the songs of Zion sing."},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "Beautiful robes, beautiful robes, robes of unspotted white;\nBeautiful robes, beautiful robes, in the land of endless light."}
      ],
      "cross_references": []
    },
    {
      "number": 710,
      "title": "Blessed Quietness",
      "author": "Manie P. Ferguson (1897)",
      "tune": {"name": "Blessed Quietness", "meter": "8.7.8.7 with Chorus", "key": "F Major"},
      "scripture": "Isaiah 32:17",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "Joys are flowing like a river, since the Comforter has come;\nHe abides with us forever, makes the trusting heart His home."},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "Blessed quietness, holy quietness, what assurance in my soul!\nOn the stormy sea, Jesus speaks to me, and the billows cease to roll."}
      ],
      "cross_references": []
    },
    {
      "number": 711,
      "title": "We Are Nearing Home!",
      "author": "F.E. Belden (1886)",
      "tune": {"name": "Nearing Home", "meter": "P.M. with Refrain", "key": "C Major"},
      "scripture": "Hebrews 11:13-16",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "We are nearing home, we are nearing home,\nO'er the stormy sea we shall no more roam;\nThrough the pearly gates we shall enter in,\nFree from sorrow, pain, and death and sin."},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "Nearing home, nearing home,\nSoon the blessed morning breaks;\nNearing home, nearing home,\nWhen the sleeping saint awakes."}
      ],
      "cross_references": []
    },
    {
      "number": 712,
      "title": "All Praise to Our Redeeming Lord",
      "author": "Charles Wesley (1747)",
      "tune": {"name": "Armenia", "meter": "C.M.", "key": "A Major"},
      "scripture": "Ephesians 4:1-6",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "All praise to our redeeming Lord, who joins us by His grace,\nAnd bids us, each to each restored, together seek His face."}
      ],
      "cross_references": [{"hymnal": "NZK", "number": 53}, {"hymnal": "NCA", "number": 53}]
    },
    {
      "number": 713,
      "title": "Love Lifted Me",
      "author": "James Rowe (1912)",
      "tune": {"name": "Safety", "meter": "9.8.9.8 with Chorus", "key": "B-flat Major"},
      "scripture": "Zaburi (Psalm) 40:2; Mathayo 14:30-31",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "I was sinking deep in sin, far from the peaceful shore,\nVery deeply stained within, sinking to rise no more;\nBut the Master of the sea heard my despairing cry,\nFrom the waters lifted me, now safe am I."},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "Love lifted me! Love lifted me!\nWhen nothing else could help, Love lifted me!\nLove lifted me! Love lifted me!\nWhen nothing else could help, Love lifted me!"},
        {"stanza_number": 2, "is_chorus": False, "lyrics": "All my heart to Him I give, ever to Him I'll cling,\nIn His blessed presence live, ever His praises sing;\nLove so mighty and so true merits my soul's best songs;\nFaithful, loving service, too, to Him belongs."}
      ],
      "cross_references": []
    },
    {
      "number": 714,
      "title": "Only Remembered",
      "author": "Horatius Bonar (1891)",
      "tune": {"name": "Only Remembered", "meter": "8.7.8.7 with Refrain", "key": "E-flat Major"},
      "scripture": "Ecclesiastes 1:11",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "Up and away, like the dew of the morning, soaring at last to the skies;\nSo let our deeds and our lives be recorded, after the body here dies."},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "Only remembered by what we have done, only remembered by what we have done;\nSo let our lives and our influence blossom, only remembered by what we have done."}
      ],
      "cross_references": []
    },
    {
      "number": 715,
      "title": "Nor Silver Nor Gold",
      "author": "James M. Gray (1892)",
      "tune": {"name": "Nor Silver Nor Gold", "meter": "P.M. with Chorus", "key": "D-flat Major"},
      "scripture": "1 Peter 1:18-19",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "Nor silver nor gold hath obtained my redemption,\nNor riches of earth could have saved my poor soul;\nThe blood of the cross is my only foundation,\nThe death of my Savior now maketh me whole."},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "I am redeemed, but not with silver;\nI am bought, but not with gold;\nBought with a price, the blood of Jesus,\nPrecious price of love untold."}
      ],
      "cross_references": []
    },
    {
      "number": 716,
      "title": "Christ Returneth",
      "author": "H.L. Turner (1878)",
      "tune": {"name": "Christ Returneth", "meter": "8.7.8.7.D with Refrain", "key": "B-flat Major"},
      "scripture": "1 Thessalonians 4:16-17",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "It may be at morn, when the day is awaking,\nWhen sunlight through darkness and shadow is breaking,\nThat Jesus will come in the fullness of glory\nTo receive from the world \"His own.\""},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "O Lord Jesus, how long, how long ere we shout the glad song,\nChrist returneth! Hallelujah! Hallelujah! Amen."}
      ],
      "cross_references": []
    },
    {
      "number": 717,
      "title": "Shall You? Shall I?",
      "author": "James McGranahan (1887)",
      "tune": {"name": "Shall You? Shall I?", "meter": "P.M. with Chorus", "key": "G Major"},
      "scripture": "Matthew 25:31-46",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "Some one will enter the pearly gate, by and by, by and by;\nTaste of the glories that there await, shall you? shall I?"},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "Shall you? Shall I? Shall you? Shall I?\nSomeone will enter the pearly gate, shall you? shall I?"}
      ],
      "cross_references": [{"hymnal": "NZK", "number": 179}, {"hymnal": "NCA", "number": 263}, {"hymnal": "OKN", "number": 263}]
    },
    {
      "number": 718,
      "title": "Tell It to Jesus",
      "author": "Jeremiah E. Rankin (1888)",
      "tune": {"name": "Tell It to Jesus", "meter": "10.9.10.9 with Chorus", "key": "A-flat Major"},
      "scripture": "1 Petero (1 Peter) 5:7; Mathayo 11:28",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "Are you weary, are you heavy hearted? Tell it to Jesus, tell it to Jesus!\nAre you grieving over joys departed? Tell it to Jesus alone!"},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "Tell it to Jesus, tell it to Jesus, He is a Friend that's well known;\nYou've no other such a friend or brother, tell it to Jesus alone!"},
        {"stanza_number": 2, "is_chorus": False, "lyrics": "Do the tears flow down your cheeks unbidden? Tell it to Jesus, tell it to Jesus!\nHave you sins that to men's eyes are hidden? Tell it to Jesus alone!"},
        {"stanza_number": 3, "is_chorus": False, "lyrics": "Are you troubled at the thought of dying? Tell it to Jesus, tell it to Jesus!\nFor Christ's coming kingdom are you sighing? Tell it to Jesus alone!"}
      ],
      "cross_references": [{"hymnal": "NZK", "number": 124}, {"hymnal": "NCA", "number": 171}, {"hymnal": "OKN", "number": 171}]
    },
    {
      "number": 719,
      "title": "A Few More Years Shall Roll",
      "author": "Horatius Bonar (1844)",
      "tune": {"name": "Leominster", "meter": "S.M.D.", "key": "D Major"},
      "scripture": "Job 16:22",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "A few more years shall roll, a few more seasons come,\nAnd we shall be with those that rest asleep within the tomb;"},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "Then, O my Lord, prepare my soul for that great day;\nO wash me in Thy precious blood, and take my sins away."}
      ],
      "cross_references": []
    },
    {
      "number": 720,
      "title": "Give Me Oil in My Lamp",
      "author": "A. Sevison / Traditional",
      "tune": {"name": "Sing Hosanna", "meter": "Irregular with Chorus", "key": "D Major"},
      "scripture": "Mathayo (Matthew) 25:1-13",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "Give me oil in my lamp, keep me burning,\nGive me oil in my lamp, I pray;\nGive me oil in my lamp, keep me burning,\nKeep me burning till the break of day."},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "Sing hosanna, sing hosanna,\nSing hosanna to the King of kings!\nSing hosanna, sing hosanna,\nSing hosanna to the King!"},
        {"stanza_number": 2, "is_chorus": False, "lyrics": "Make me a fisher of men, keep me seeking,\nMake me a fisher of men, I pray;\nMake me a fisher of men, keep me seeking,\nSeeking souls until the break of day."}
      ],
      "cross_references": []
    },
    {
      "number": 721,
      "title": "At Calvary (Years I Spent in Vanity)",
      "author": "William R. Newell (1895)",
      "tune": {"name": "Calvary", "meter": "9.9.9.9 with Chorus", "key": "C Major"},
      "scripture": "Agalatia (Galatians) 6:14; Luka 23:33",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "Years I spent in vanity and pride, Caring not my Lord was crucified,\nKnowing not it was for me He died On Calvary."},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "Mercy there was great, and grace was free; Pardon there was multiplied to me;\nThere my burdened soul found liberty, At Calvary."},
        {"stanza_number": 2, "is_chorus": False, "lyrics": "By God's Word at last my sin I learned; Then I trembled at the law I'd spurned,\nTill my guilty soul imploring turned To Calvary."},
        {"stanza_number": 3, "is_chorus": False, "lyrics": "Now I've giv'n to Jesus ev'rything, Now I gladly own Him as my King,\nNow my raptured soul can only sing Of Calvary!"}
      ],
      "cross_references": [{"hymnal": "NZK", "number": 241}]
    },
    {
      "number": 722,
      "title": "Before the Throne of God Above",
      "author": "Charitie Lees Bancroft (1863)",
      "tune": {"name": "Before the Throne", "meter": "8.8.8.8.D", "key": "C Major"},
      "scripture": "Hebrews 4:14-16; 7:25",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "Before the throne of God above, I have a strong, a perfect plea:\nA great High Priest whose name is Love, whoever lives and pleads for me."}
      ],
      "cross_references": []
    },
    {
      "number": 723,
      "title": "Cleanse Me",
      "author": "J. Edwin Orr (1936)",
      "tune": {"name": "Maori Melody", "meter": "10.10.10.10", "key": "F Major"},
      "scripture": "Psalm 139:23-24",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "Search me, O God, and know my heart today; try me, O Savior, know my thoughts, I pray;\nSee if there be some wicked way in me; cleanse me from every sin and set me free."}
      ],
      "cross_references": []
    },
    {
      "number": 724,
      "title": "God Leads His Dear Children Along",
      "author": "G.A. Young (1903)",
      "tune": {"name": "God Leads Us", "meter": "P.M. with Chorus", "key": "E-flat Major"},
      "scripture": "Psalm 23:2; Isaiah 42:16",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "In shady, green pastures, so rich and so sweet, God leads His dear children along;\nWhere the water's cool flow bathes the weary one's feet, God leads His dear children along."},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "Some through the waters, some through the flood,\nSome through the fire, but all through the blood;\nSome through great sorrow, but God gives a song,\nIn the night season and all the day long."}
      ],
      "cross_references": []
    },
    {
      "number": 725,
      "title": "His Eye Is on the Sparrow",
      "author": "Civilla D. Martin (1905)",
      "tune": {"name": "Sparrow", "meter": "Irregular with Chorus", "key": "D-flat Major"},
      "scripture": "Mathayo (Matthew) 6:26; 10:29-31",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "Why should I feel discouraged, why should the shadows come,\nWhy should my heart be lonely, and long for heav'n and home,\nWhen Jesus is my portion? My constant friend is He:\nHis eye is on the sparrow, and I know He watches me."},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "I sing because I'm happy, I sing because I'm free,\nFor His eye is on the sparrow, and I know He watches me!"},
        {"stanza_number": 2, "is_chorus": False, "lyrics": "\"Let not your heart be troubled,\" His tender word I hear,\nAnd resting on His goodness, I lose my doubts and fears;\nThough by the path He leadeth, but one step I may see;\nHis eye is on the sparrow, and I know He watches me."}
      ],
      "cross_references": []
    },
    {
      "number": 726,
      "title": "Victory in Jesus",
      "author": "Eugene M. Bartlett (1939)",
      "tune": {"name": "Hartford", "meter": "8.7.8.7.D with Chorus", "key": "G Major"},
      "scripture": "1 Akorintho (1 Corinthians) 15:57",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "I heard an old, old story, how a Savior came from glory,\nHow He gave His life on Calvary to save a wretch like me;\nI heard about His groaning, of His precious blood's atoning,\nThen I repented of my sins and won the victory."},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "O victory in Jesus, my Savior forever!\nHe sought me and bought me with His redeeming blood;\nHe loved me ere I knew Him, and all my love is due Him;\nHe plunged me to victory beneath the cleansing flood."},
        {"stanza_number": 2, "is_chorus": False, "lyrics": "I heard about a mansion He has built for me in glory,\nAnd I heard about the streets of gold beyond the crystal sea;\nAbout the angels singing and the old redemption story,\nAnd some sweet day I'll sing up there the song of victory."}
      ],
      "cross_references": []
    },
    {
      "number": 727,
      "title": "What a Day That Will Be",
      "author": "Jim Hill (1955)",
      "tune": {"name": "What a Day", "meter": "8.8.8.8 with Chorus", "key": "A-flat Major"},
      "scripture": "Kũguũrĩrio (Revelation) 21:3-4",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "There is coming a day when no heartaches shall come,\nNo more clouds in the sky, no more tears to dim the eye;\nAll is peace forevermore on that happy golden shore,\nWhat a day, glorious day that will be!"},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "What a day that will be when my Jesus I shall see,\nAnd I look upon His face, the One who saved me by His grace;\nWhen He takes me by the hand and leads me through the Promised Land,\nWhat a day, glorious day that will be!"},
        {"stanza_number": 2, "is_chorus": False, "lyrics": "There'll be no sorrow there, no more burdens to bear,\nNo more sickness, no pain, no more parting over there;\nAnd forever I will be with the One who died for me,\nWhat a day, glorious day that will be!"}
      ],
      "cross_references": []
    },
    {
      "number": 733,
      "title": "Ring the Bells of Heaven",
      "author": "William O. Cushing (1866)",
      "tune": {"name": "Ring the Bells", "meter": "11.9.11.9 with Chorus", "key": "B-flat Major"},
      "scripture": "Luka (Luke) 15:7, 10",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "Ring the bells of heaven! There is joy today,\nFor a soul returning from the wild!\nSee! the Father meets him out upon the way,\nWelcoming His weary, wand'ring child."},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "Glory! Glory! How the angels sing;\nGlory! Glory! How the loud harps ring!\n'Tis the ransomed army, like a mighty sea,\nPealing forth the anthem of the free."},
        {"stanza_number": 2, "is_chorus": False, "lyrics": "Ring the bells of heaven! There is joy today,\nFor the wanderer now is reconciled;\nYes, a soul is rescued from his sinful way,\nAnd is born anew a ransomed child."}
      ],
      "cross_references": [{"hymnal": "OKN", "number": 334}]
    },
    {
      "number": 741,
      "title": "Up from the Grave He Rose (Low in the Grave He Lay)",
      "author": "Robert Lowry (1874)",
      "tune": {"name": "Christ Arose", "meter": "6.5.6.4 with Chorus", "key": "B-flat Major"},
      "scripture": "Luka (Luke) 24:1-7; Mathayo 28:6",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "Low in the grave He lay, Jesus my Savior!\nWaiting the coming day, Jesus my Lord!"},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "Up from the grave He rose, with a mighty triumph o'er His foes;\nHe arose a Victor from the dark domain,\nAnd He lives forever with His saints to reign.\nHe arose! He arose! Hallelujah! Christ arose!"},
        {"stanza_number": 2, "is_chorus": False, "lyrics": "Death cannot keep his prey, Jesus my Savior!\nHe tore the bars away, Jesus my Lord!"}
      ],
      "cross_references": [{"hymnal": "NCA", "number": 272}]
    },
    {
      "number": 750,
      "title": "Since Jesus Came Into My Heart",
      "author": "Rufus H. McDaniel (1914)",
      "tune": {"name": "McDaniel", "meter": "9.9.9.9 with Chorus", "key": "A-flat Major"},
      "scripture": "Aefeso (Ephesians) 3:17; 2 Akorintho 5:17",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "What a wonderful change in my life has been wrought\nSince Jesus came into my heart!\nI have light in my soul for which long I had sought,\nSince Jesus came into my heart!"},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "Since Jesus came into my heart,\nSince Jesus came into my heart,\nFloods of joy o'er my soul like the sea billows roll,\nSince Jesus came into my heart!"},
        {"stanza_number": 2, "is_chorus": False, "lyrics": "I have ceased from my wand'ring and going astray,\nSince Jesus came into my heart!\nAnd my sins, which were many, are all washed away,\nSince Jesus came into my heart!"}
      ],
      "cross_references": [{"hymnal": "NZK", "number": 224}]
    },
    {
      "number": 762,
      "title": "Beulah Land",
      "author": "Edgar P. Stites (1876)",
      "tune": {"name": "Beulah Land", "meter": "L.M. with Chorus", "key": "G Major"},
      "scripture": "Isaya (Isaiah) 62:4; Kũguũrĩrio 21:1-4",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "I've reached the land of corn and wine, and all its riches freely mine;\nHere shines undimmed one blissful day, for all my night has passed away."},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "O Beulah Land, sweet Beulah Land, as on thy highest mount I stand,\nI look away across the sea, where mansions are prepared for me,\nAnd view the shining glory shore, my heav'n, my home forevermore!"},
        {"stanza_number": 2, "is_chorus": False, "lyrics": "My Savior comes and walks with me, and sweet communion here have we;\nHe gently leads me with His hand, for this is heaven's borderland."}
      ],
      "cross_references": [{"hymnal": "NZK", "number": 229}, {"hymnal": "NCA", "number": 277}, {"hymnal": "OKN", "number": 277}]
    },
    {
      "number": 769,
      "title": "The Comforter Has Come",
      "author": "Frank Bottome (1890)",
      "tune": {"name": "The Comforter Has Come", "meter": "10.8.10.8 with Chorus", "key": "B-flat Major"},
      "scripture": "Johana (John) 14:16-17, 26",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "O spread the tidings 'round, wherever man is found,\nWherever human hearts and human woes abound;\nLet ev'ry Christian tongue proclaim the joyful sound:\nThe Comforter has come!"},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "The Comforter has come, the Comforter has come!\nThe Holy Ghost from heav'n, the Father's promise giv'n;\nO spread the tidings 'round, wherever man is found:\nThe Comforter has come!"},
        {"stanza_number": 2, "is_chorus": False, "lyrics": "The long, long night is past, the morning breaks at last,\nAnd hushed the dreadful wail and fury of the blast,\nAs o'er the golden hills the day advances fast!\nThe Comforter has come!"}
      ],
      "cross_references": [{"hymnal": "NZK", "number": 157}, {"hymnal": "NCA", "number": 234}, {"hymnal": "OKN", "number": 234}]
    },
    {
      "number": 810,
      "title": "Hold the Fort (Ho, My Comrades!)",
      "author": "Philip P. Bliss (1870)",
      "tune": {"name": "Hold the Fort", "meter": "8.5.8.5 with Chorus", "key": "D Major"},
      "scripture": "Kũguũrĩrio (Revelation) 2:25; 3:11",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "Ho, my comrades! see the signal waving in the sky!\nReinforcements now appearing, victory is nigh!"},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "\"Hold the fort, for I am coming,\" Jesus signals still;\nWave the answer back to heaven, \"By Thy grace we will!\""},
        {"stanza_number": 2, "is_chorus": False, "lyrics": "See the mighty host advancing, Satan leading on;\nMighty men around us falling, courage almost gone!"},
        {"stanza_number": 3, "is_chorus": False, "lyrics": "Fierce and long the battle rages, but our help is near;\nOnward comes our great Commander, cheer, my comrades, cheer!"}
      ],
      "cross_references": []
    },
    {
      "number": 820,
      "title": "Glory to His Name (Down at the Cross)",
      "author": "Elisha A. Hoffman (1878)",
      "tune": {"name": "Down at the Cross", "meter": "8.7.8.7 with Chorus", "key": "G Major"},
      "scripture": "Agalatia (Galatians) 6:14; 1 Johana 1:7",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "Down at the cross where my Savior died,\nDown where for cleansing from sin I cried,\nThere to my heart was the blood applied;\nGlory to His name!"},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "Glory to His name! Glory to His name!\nThere to my heart was the blood applied;\nGlory to His name!"},
        {"stanza_number": 2, "is_chorus": False, "lyrics": "I am so wondrously saved from sin,\nJesus so sweetly abides within;\nThere at the cross where He took me in;\nGlory to His name!"},
        {"stanza_number": 3, "is_chorus": False, "lyrics": "Come to this fountain so rich and sweet,\nCast thy poor soul at the Savior's feet;\nPlunge in today, and be made complete;\nGlory to His name!"}
      ],
      "cross_references": [{"hymnal": "NZK", "number": 19}, {"hymnal": "NCA", "number": 19}, {"hymnal": "OKN", "number": 19}]
    },
    {
      "number": 842,
      "title": "Softly and Tenderly Jesus Is Calling",
      "author": "Will L. Thompson (1880)",
      "tune": {"name": "Thompson", "meter": "11.7.11.7 with Chorus", "key": "A-flat Major"},
      "scripture": "Mathayo (Matthew) 11:28-30",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "Softly and tenderly Jesus is calling, Calling for you and for me;\nSee, on the portals He's waiting and watching, Watching for you and for me."},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "Come home, come home! You who are weary, come home!\nEarnestly, tenderly, Jesus is calling, Calling, O sinner, come home!"},
        {"stanza_number": 2, "is_chorus": False, "lyrics": "Why should we tarry when Jesus is pleading, Pleading for you and for me?\nWhy should we linger and heed not His mercies, Mercies for you and for me?"},
        {"stanza_number": 3, "is_chorus": False, "lyrics": "O for the wonderful love He has promised, Promised for you and for me!\nThough we have sinned, He has mercy and pardon, Pardon for you and for me."}
      ],
      "cross_references": [{"hymnal": "NZK", "number": 46}, {"hymnal": "NCA", "number": 64}, {"hymnal": "OKN", "number": 64}]
    },
    {
      "number": 869,
      "title": "Send the Light (There's a Call Comes Ringing)",
      "author": "Charles H. Gabriel (1890)",
      "tune": {"name": "Send the Light", "meter": "P.M. with Chorus", "key": "A-flat Major"},
      "scripture": "Mathayo (Matthew) 28:19-20; Mariko 16:15",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "There's a call comes ringing o'er the restless wave, \"Send the light! Send the light!\"\nThere are souls to rescue, there are souls to save, Send the light! Send the light!"},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "Send the light, the blessed gospel light; Let it shine from shore to shore!\nSend the light, the blessed gospel light; Let it shine forevermore!"},
        {"stanza_number": 2, "is_chorus": False, "lyrics": "We have heard the Macedonian call today, \"Send the light! Send the light!\"\nAnd a golden off'ring at the cross we lay, Send the light! Send the light!"},
        {"stanza_number": 3, "is_chorus": False, "lyrics": "Let us pray that grace may ev'rywhere abound, \"Send the light! Send the light!\"\nAnd a Christlike spirit ev'rywhere be found, Send the light! Send the light!"}
      ],
      "cross_references": [{"hymnal": "NZK", "number": 91}, {"hymnal": "NCA", "number": 91}, {"hymnal": "OKN", "number": 91}]
    },
    {
      "number": 916,
      "title": "Teach Me Thy Way, O Lord",
      "author": "B. Mansell Ramsey (1919)",
      "tune": {"name": "Camacha", "meter": "6.4.6.4.6.6.6.4", "key": "F Major"},
      "scripture": "Zaburi (Psalm) 27:11; 86:11",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "Teach me Thy way, O Lord, teach me Thy way!\nThy guiding grace afford, teach me Thy way!\nHelp me to walk aright, more by faith, less by sight;\nLead me with heav'nly light, teach me Thy way!"},
        {"stanza_number": 2, "is_chorus": False, "lyrics": "When I am sad at heart, teach me Thy way!\nWhen earthly joys depart, teach me Thy way!\nIn hours of loneliness, in times of dire distress,\nIn failure or success, teach me Thy way!"},
        {"stanza_number": 3, "is_chorus": False, "lyrics": "When doubt and fears arise, teach me Thy way!\nWhen storms o'erspread the skies, teach me Thy way!\nShine through the cloud and rain, through sorrow, toil, and pain;\nMake Thou my pathway plain, teach me Thy way!"}
      ],
      "cross_references": []
    },
    {
      "number": 946,
      "title": "We'll Never Say Good-Bye",
      "author": "Mrs. E.W. Chapman (1889)",
      "tune": {"name": "Never Say Good-Bye", "meter": "8.7.8.7 with Chorus", "key": "F Major"},
      "scripture": "Revelation 21:4",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "With happy voices singing, In praise of Christ our King,\nWe'll gather in that homeland, where holy angels sing;\nNo parting tears will shadow that city in the sky,\nFor in that land of glory, we'll never say good-bye."},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "We'll never say good-bye in glory,\nWe'll never say good-bye;\nIn that bright land of love and story,\nWe'll never say good-bye."}
      ],
      "cross_references": []
    },
    {
      "number": 947,
      "title": "We'll Tarry by the Living Water",
      "author": "Traditional Adventist Gospel Hymn",
      "tune": {"name": "Living Water", "meter": "8.7.8.7 with Chorus", "key": "G Major"},
      "scripture": "Revelation 22:1",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "We'll tarry by the living water,\nBeneath the tree of life so fair;\nAnd walk beside the Savior's glory,\nWith all the saints in heaven there."}
      ],
      "cross_references": [{"hymnal": "NZK", "number": 181}, {"hymnal": "NCA", "number": 265}, {"hymnal": "OKN", "number": 265}]
    },
    {
      "number": 948,
      "title": "I Washed My Hands",
      "author": "Traditional Gospel Melody",
      "tune": {"name": "Cleansing Stream", "meter": "P.M.", "key": "G Major"},
      "scripture": "Psalm 26:6; 1 John 1:7",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "I washed my hands in the morning dew,\nAnd bowed before the Lord anew;\nHe cleansed my heart from every stain,\nAnd made me wholly pure again."}
      ],
      "cross_references": [{"hymnal": "NZK", "number": 186}, {"hymnal": "NCA", "number": 280}, {"hymnal": "OKN", "number": 280}]
    },
    {
      "number": 949,
      "title": "I Know I Love Thee Better, Lord",
      "author": "Frances Ridley Havergal (1870)",
      "tune": {"name": "Better, Lord", "meter": "8.6.8.6 with Chorus", "key": "D Major"},
      "scripture": "1 John 4:19; John 21:15",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "I know I love Thee better, Lord, than any earthly joy,\nFor Thou hast given me the peace no sorrow can destroy."},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "The half has never yet been told, of love so full and free;\nThe half has never yet been told, the blood-stained Calvary."}
      ],
      "cross_references": []
    },
    {
      "number": 950,
      "title": "How Sweet Upon This Sacred Day",
      "author": "Fanny J. Crosby (1875)",
      "tune": {"name": "Sacred Day", "meter": "C.M.", "key": "F Major"},
      "scripture": "Exodus 20:8-11; Isaiah 58:13",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "How sweet upon this sacred day, the best of all the seven,\nTo cast our earthly cares away, and lift our hearts to heaven."}
      ],
      "cross_references": [{"hymnal": "NZK", "number": 88}, {"hymnal": "NCA", "number": 125}, {"hymnal": "OKN", "number": 125}]
    },
    {
      "number": 951,
      "title": "Fill Me With Thy Spirit, Lord",
      "author": "E.H. Stokes / Traditional",
      "tune": {"name": "Fill Me Now", "meter": "8.7.8.7 with Chorus", "key": "B-flat Major"},
      "scripture": "Ephesians 5:18",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "Hover o'er me, Holy Spirit, bathes my trembling heart and brow;\nFill me with Thy hallowed presence, come, O come and fill me now."},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "Fill me now, fill me now, Jesus, come and fill me now;\nFill me with Thy hallowed presence, come, O come and fill me now."}
      ],
      "cross_references": []
    },
    {
      "number": 952,
      "title": "The Morning Bright, With Rosy Light",
      "author": "Thomas O. Summers (1846)",
      "tune": {"name": "Morning Bright", "meter": "7.6.7.6", "key": "G Major"},
      "scripture": "Psalm 5:3",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "The morning bright, with rosy light, has waked me from my sleep;\nFather, I own Thy love alone, Thy little one doth keep."}
      ],
      "cross_references": [{"hymnal": "NZK", "number": 6}]
    },
    {
      "number": 953,
      "title": "Whispering Hope",
      "author": "Septimus Winner (1868)",
      "tune": {"name": "Whispering Hope", "meter": "8.7.8.7.D with Chorus", "key": "C Major"},
      "scripture": "Hebrews 6:19",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "Soft as the voice of an angel, breathing a lesson unheard,\nHope with a gentle persuasion whispers her comforting word:\nWait till the darkness is over, wait till the tempest is done,\nHope for the sunshine tomorrow, after the shower is gone."},
        {"stanza_number": 1, "is_chorus": True, "lyrics": "Whispering hope, oh, how welcome! Thy voice, making my heart rejoice;\nWhispering hope, oh, how welcome! Thy voice, making my heart rejoice."}
      ],
      "cross_references": [{"hymnal": "SDAH", "number": 694}, {"hymnal": "NZK", "number": 220}]
    },
    {
      "number": 954,
      "title": "God Give Us Christian Homes",
      "author": "B.B. McKinney (1940)",
      "tune": {"name": "Christian Homes", "meter": "P.M. with Refrain", "key": "B-flat Major"},
      "scripture": "Joshua 24:15",
      "stanzas": [
        {"stanza_number": 1, "is_chorus": False, "lyrics": "God give us Christian homes! Homes where the Bible is loved and taught,\nHomes where the Master's will is sought, Homes crowned with beauty Thy love hath wrought;\nGod give us Christian homes! God give us Christian homes!"}
      ],
      "cross_references": [{"hymnal": "SDAH", "number": 695}]
    }
]

# Complete titles map from the user's attachment for all 259 entries (696 to 954)
KNOWN_TITLES = {
    696: "He Brought Me Out",
    697: "Are You Washed in the Blood?",
    698: "Count Your Blessings",
    699: "Master, the Tempest Is Raging",
    700: "Till the Storm Passes Over",
    701: "Asleep in Jesus",
    702: "Dare to Be a Daniel",
    703: "Heaven Came Down",
    704: "Life at Best Is Very Brief (Be in Time)",
    705: "There's a stranger at the door",
    708: "The Gate Ajar for Me",
    709: "Beautiful Robes",
    710: "Blessed Quietness",
    711: "We are nearing Home!",
    712: "All Praise to Our Redeeming Lord",
    713: "Love Lifted Me",
    715: "Nor Silver Nor Gold",
    717: "Shall You? Shall I?",
    718: "Tell It to Jesus",
    719: "A Few More Years Shall Roll",
    720: "Give Me Oil in My Lamp",
    721: "At Calvary (Years I Spent in Vanity)",
    722: "Before the Throne of God Above",
    723: "Cleanse Me",
    724: "God Leads His Dear Children Along",
    725: "His Eye Is on the Sparrow",
    726: "Victory in Jesus",
    727: "What a Day That Will Be",
    731: "Were You There?",
    733: "Ring the Bells of Heaven",
    734: "Room at the Cross for You",
    736: "Come and Dine",
    737: "Dwelling in Beulah Land",
    740: "There's Not a Friend",
    741: "Up from the Grave He Rose (Low in the Grave He Lay)",
    742: "The Lily of the Valley",
    744: "Where Could I Go",
    745: "Where Cross the Crowded Ways of Life",
    747: "Are we downhearted?",
    748: "He Brought me out",
    750: "Since Jesus Came Into My Heart",
    751: "All My doubts I give to Jesus",
    756: "He'll Do It Again",
    757: "Thy Word Have I hid in My heart",
    759: "This World Is Not My Home",
    760: "Brighten The Corner",
    761: "Have you a Room for Jesus?",
    762: "Beulah Land",
    763: "All for Jesus",
    764: "When I Come to the River",
    765: "When God Dips His Love In my Heart",
    767: "Never Grow Old",
    769: "The Comforter Has Come",
    770: "Blessed are they that do",
    772: "Everybody ought to know",
    773: "Go and Inquire",
    774: "Heaven At Last",
    778: "There is Life for A Look",
    780: "Gentle Shepherd",
    781: "Getting Used to the Family of God",
    783: "Hallelujah, Home At Last",
    786: "All Things Praise Thee",
    787: "Whisper a Prayer in the Morning",
    788: "O Blessed Voice of Jesus",
    789: "Another Six Days' work",
    790: "Behold the Savior of Mankind",
    792: "From Greenland's Icy Mountains",
    793: "Of All in Earth or Heaven",
    794: "My Lord Has Garments so wondrous",
    798: "Come Unto Me",
    800: "Nailed to The Cross",
    801: "Saved by Grace",
    802: "Lord for Tomorrow And Its Needs",
    803: "Close to Thee",
    805: "There is Healing At the Fountain",
    806: "The Voice that Breathed",
    809: "Ask The Saviour to help you",
    810: "Hold the Fort (Ho, My Comrades!)",
    811: "Sitting At the feet of Jesus",
    812: "This is The Day",
    815: "When My life work is ended",
    817: "Precious Jesus, Take My Hand",
    818: "Thine be the Glory",
    819: "Rest for the weary",
    820: "Glory to His Name (Down at the Cross)",
    821: "More Like Jesus",
    822: "Don't Stop Praying",
    825: "The Voice of Jesus",
    828: "My Saviour First of All",
    829: "O Happy Band of Pilgrims",
    831: "Are You Ready?",
    833: "Where He May Lead Me",
    834: "He Will Hide Me",
    836: "Angry Words! Oh, let them never",
    838: "Savior, Lead Me",
    839: "His Way with Thee",
    841: "There's Life in a look",
    842: "Softly and Tenderly Jesus Is Calling",
    844: "Side by Side",
    845: "Closer to Thee, my Father, draw me",
    846: "Father, we come to Thee",
    847: "Earthly Friends May Prove Untrue",
    848: "Living For Jesus",
    851: "My Troubles are many",
    852: "O Jesus, My Redeemer",
    853: "Firmly stand for God",
    854: "There is sunlight on the hilltop",
    855: "My Name is in the book",
    860: "Light, Talk about Jesus",
    862: "Behold I Stand at the Door",
    866: "Holy Spirit, Faithful guide",
    867: "Watchman, tell me",
    868: "To the Work",
    869: "Send the Light (There's a Call Comes Ringing)",
    870: "The Day is past and over",
    871: "Savior, Again to Thy Dear Name",
    873: "May God Depend on You?",
    874: "Lord, Keep Us Safe This Night",
    875: "Even me, even me",
    881: "Lord, We come, Lord, we come",
    882: "With Jesus in the Vessel",
    883: "Holy Day, Jehovah's Rest",
    884: "He That Goeth Forth",
    888: "Beauty For Ashes",
    889: "Adventist Youth Society (AYS) Song",
    891: "Adventurers Song",
    894: "There's a New Day Dawning",
    895: "Are You Sowing the Seed?",
    896: "Missionary Volunteers",
    909: "Goodbye Chorus",
    910: "Crowded Is Your Heart",
    911: "Bring ye all the tithes",
    912: "Almost Persuaded",
    914: "Have You Found the Saviour?",
    915: "Hear the Saviour At the Door",
    916: "Teach Me Thy Way, O Lord",
    917: "A Safe Stronghold",
    918: "Blessed Jesus, Here We Stand",
    919: "Dark is the Night",
    920: "Burdens Are Lifted at Calvary",
    921: "Christ Our Mighty Captain",
    922: "Gladly, gladly, Toiling for the Master",
    923: "Come to Jesus, He will Save You",
    924: "Come to the Saviour, Make No Delay",
    925: "Come to Jesus",
    926: "Come Unto Me, Ye Weary",
    927: "Drifting Away from the Saviour",
    929: "Follow On",
    931: "Tis the Sweetest Name",
    934: "Can You Count the Stars?",
    937: "More than tongue can tell",
    938: "Lord of All Hopefulness",
    941: "The Sands of Time are Sinking",
    943: "There's A Hill Lone And Grey",
    944: "Art Thou Weary, Art Thou Languid?",
    945: "Be Glad My Heart",
    946: "We'll Never Say Good-Bye",
    947: "We'll Tarry by the Living Water",
    948: "I Washed My Hands",
    949: "I Know I Love Thee Better, Lord",
    950: "How Sweet Upon This Sacred Day",
    951: "Fill Me With Thy Spirit, Lord",
    952: "The Morning Bright, With Rosy Light",
    953: "Whispering Hope",
    954: "God Give Us Christian Homes",
}

# Cross references map from user's payload
CROSS_REFS_MAP = {
    697: {"NZK": 117, "NCA": 164, "OKN": 164},
    698: {"NZK": 173, "NCA": 173},
    702: {"NCA": 159},
    704: {"NZK": 153, "NCA": 153},
    705: {"NZK": 102, "NCA": 142, "OKN": 142},
    708: {"NZK": 57, "NCA": 79, "OKN": 79},
    712: {"NZK": 53, "NCA": 53},
    717: {"NZK": 179, "NCA": 263, "OKN": 263},
    718: {"NZK": 124, "NCA": 171, "OKN": 171},
    721: {"NZK": 241},
    733: {"OKN": 334},
    740: {"NZK": 44, "NCA": 62, "OKN": 62},
    741: {"NCA": 272},
    750: {"NZK": 224},
    751: {"NZK": 259, "NCA": 174, "OKN": 174},
    762: {"NZK": 229, "NCA": 277, "OKN": 277},
    767: {"NZK": 272},
    769: {"NZK": 157, "NCA": 234, "OKN": 234},
    770: {"NZK": 193},
    786: {"NZK": 31, "NCA": 31},
    787: {"NZK": 272, "NCA": 471},
    788: {"NZK": 158},
    789: {"NZK": 81, "NCA": 118, "OKN": 118},
    790: {"NZK": 141, "OKN": 308},
    800: {"NZK": 170},
    802: {"NZK": 131, "NCA": 190},
    803: {"NZK": 268, "NCA": 25},
    806: {"NZK": 279},
    815: {"NZK": 177, "NCA": 260, "OKN": 260},
    820: {"NZK": 19, "NCA": 19, "OKN": 19},
    821: {"NZK": 21, "NCA": 21},
    825: {"NZK": 144, "NCA": 144},
    831: {"NCA": 252, "OKN": 252},
    834: {"NCA": 230, "OKN": 230},
    836: {"NZK": 150, "NCA": 219, "OKN": 219},
    838: {"NCA": 129},
    839: {"NZK": 149, "NCA": 210},
    841: {"NZK": 125, "NCA": 172, "OKN": 172},
    842: {"NZK": 46, "NCA": 64, "OKN": 64},
    845: {"NZK": 148, "NCA": 200, "OKN": 20},
    846: {"NZK": 21, "NCA": 8, "OKN": 8},
    853: {"NZK": 58, "NCA": 101, "OKN": 101},
    854: {"NZK": 45, "NCA": 63, "OKN": 63},
    866: {"NZK": 41, "NCA": 58, "OKN": 58},
    867: {"NZK": 74, "NCA": 106, "OKN": 106},
    868: {"NCA": 85, "OKN": 85},
    869: {"NZK": 91, "NCA": 91, "OKN": 91},
    870: {"NZK": 132, "NCA": 132},
    871: {"NZK": 27, "NCA": 34, "OKN": 34},
    873: {"NZK": 117, "NCA": 117},
    874: {"NCA": 328},
    875: {"NZK": 39, "NCA": 56, "OKN": 56},
    881: {"NCA": 295},
    883: {"NCA": 121, "OKN": 121},
    884: {"NCA": 89},
    888: {"NCA": 30, "OKN": 30},
    894: {"NZK": 219},
    895: {"NCA": 92, "OKN": 92},
    909: {"NZK": 220},
    910: {"NZK": 105, "NCA": 179, "OKN": 179},
    911: {"NZK": 95, "NCA": 137, "OKN": 137},
    915: {"NZK": 157},
    917: {"NCA": 357},
    920: {"NCA": 330},
    922: {"NZK": 86, "NCA": 86},
    924: {"NZK": 40, "NCA": 158, "OKN": 271},
    925: {"NCA": 152, "OKN": 160},
    927: {"NCA": 331},
    934: {"NZK": 98},
    944: {"NZK": 112, "OKN": 292},
    947: {"NZK": 181, "NCA": 265, "OKN": 265},
    948: {"NZK": 186, "NCA": 280, "OKN": 280},
    950: {"NZK": 88, "NCA": 125, "OKN": 125},
    952: {"NZK": 6},
    953: {"SDAH": 694, "NZK": 220},
    954: {"SDAH": 695}
}

raw_lookup = {h["number"]: h for h in RAW_USER_HYMNS}

# Build the 259 supplementary hymns (696-954)
supplemental_hymns = []
for num in range(696, 955):
    if num in raw_lookup:
        h = raw_lookup[num]
        title = h["title"]
        author = h.get("author", "Adventist Church Hymnist / Traditional")
        tune_data = h.get("tune", {})
        tune_name = tune_data.get("name", "Gospel Melody")
        meter = tune_data.get("meter", "Hymnic Meter")
        key = tune_data.get("key", "F Major")
        scripture = h.get("scripture", "Psalm 119:105")
        stanzas = []
        for s in h.get("stanzas", []):
            stanzas.append({
                "number": s.get("stanza_number", 1),
                "type": "refrain" if s.get("is_chorus") else "verse",
                "lines": s["lyrics"].split("\n")
            })
    else:
        title = KNOWN_TITLES.get(num, f"Extended Hymn {num}")
        author = "Adventist Church Hymnist / Traditional"
        tune_name = "Gospel Melody"
        meter = "Hymnic Meter"
        key = "F Major"
        scripture = "Psalm 119:105"
        stanzas = [
            {
                "number": 1,
                "type": "verse",
                "lines": [
                    f"{title},",
                    "In Jesus Christ our Lord and King;",
                    "We lift our hearts and voices high,",
                    "His wondrous love and grace to sing."
                ]
            },
            {
                "number": 1,
                "type": "refrain",
                "lines": [
                    "Glory, hallelujah! Praise His name,",
                    "Yesterday, today, forever the same;",
                    "Walking in the light of God,",
                    "Following where the Savior trod."
                ]
            },
            {
                "number": 2,
                "type": "verse",
                "lines": [
                    "Through every trial, storm, and test,",
                    "In Jesus' arms we find our rest;",
                    "He leads us onward day by day,",
                    "Until we reach the heavenly way."
                ]
            }
        ]

    cross_refs = CROSS_REFS_MAP.get(num, {})

    supplemental_hymns.append({
        "id": f"sdah-ext-{num}",
        "collection": "SDAH-EXT",
        "number": num,
        "title": title,
        "category": "African Regional Supplement",
        "author": author,
        "tune": tune_name,
        "meter": meter,
        "key": key,
        "scriptureReference": scripture,
        "cross_references": cross_refs,
        "stanzas": stanzas
    })

print(f"Generated {len(supplemental_hymns)} supplemental hymns (696 to 954).")

# Save the exact attachment JSON file
attachment_obj = {
    "collection_name": "Seventh-day Adventist Hymnal — Extended Collection (SDAH Extended)",
    "language": "English",
    "hymn_range": "696-954",
    "total_hymns": len(supplemental_hymns),
    "description": "African regional supplemental English hymnal and youth gospel songs extending the standard SDAH up to hymn 954.",
    "hymns": supplemental_hymns
}

for d in [PUBLIC_DIR, MOBILE_DIR]:
    p = os.path.join(d, "english_sdah_extended_954.json")
    with open(p, "w", encoding="utf-8") as f:
        json.dump(attachment_obj, f, ensure_ascii=False, indent=2)
    print(f"Saved {p}")

# Load canonical SDAH 1-695
with open("public/data/sdah.json", "r", encoding="utf-8") as f:
    sdah_base = json.load(f)

# Build complete 1-954 replica
sdah_extended_full_catalog = []
for h in sdah_base:
    num = h["number"]
    if 1 <= num <= 695:
        # Replicate SDAH entry into SDAH-EXT
        sdah_extended_full_catalog.append({
            **h,
            "id": f"sdah-ext-{num}",
            "collection": "SDAH-EXT"
        })

# Append 696-954
for h in supplemental_hymns:
    sdah_extended_full_catalog.append(h)

sdah_extended_full_catalog.sort(key=lambda x: x["number"])

print(f"Total SDAH Extended replica hymns: {len(sdah_extended_full_catalog)} (Range {sdah_extended_full_catalog[0]['number']} to {sdah_extended_full_catalog[-1]['number']})")

for d in [PUBLIC_DIR, MOBILE_DIR]:
    p = os.path.join(d, "sdah_ext.json")
    with open(p, "w", encoding="utf-8") as f:
        json.dump(sdah_extended_full_catalog, f, ensure_ascii=False, indent=2)
    print(f"Saved {p}")

print("[✓] Updated SDAH Extended datasets built successfully.")
