# The user has a low number of valid backup authentication codes remaining for use
codes-reminder-title = Low backup authentication codes remaining
codes-reminder-description = We noticed that you are running low on backup authentication codes. Please consider generating new codes to avoid getting locked out of your account.
codes-generate = Generate codes
codes-generate-plaintext = { codes-generate }:
lowRecoveryCodes-action = Generate codes
lowRecoveryCodes-subject =
    { $numberRemaining ->
        [one] 1 backup authentication code remaining
       *[other] { $numberRemaining } backup authentication codes remaining
   }
