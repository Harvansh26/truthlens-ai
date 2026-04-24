suspicious_patterns = [
    ("urgent", 15, "Contains urgency-based pressure tactics"),
    ("pay fee", 20, "Asks for payment, which is suspicious"),
    ("processing fee", 20, "Mentions processing fee"),
    ("click here", 10, "Contains risky call-to-action language"),
    ("share otp", 25, "Requests OTP, highly suspicious"),
    ("guaranteed job", 20, "Promises unrealistic job certainty"),
    ("selected immediately", 15, "Uses manipulative hiring promise"),
    ("limited time", 10, "Uses artificial scarcity"),
    ("earn money fast", 20, "Contains scam-like earning claim"),
    ("no interview", 20, "Unrealistic hiring shortcut detected"),
    ("join immediately", 10, "Pushes immediate joining pressure"),
    ("send money", 25, "Requests direct transfer of money"),
    ("whatsapp only", 10, "Avoids formal communication channels")
]