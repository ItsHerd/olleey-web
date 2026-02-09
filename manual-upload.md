The manual upload

Alot of these features are already implemented.

- can have 4 inputs:
    1. channel (videos already exist on youtube)
    2. url 
    3. upload (user directly uploads to our app -> supabase s3) https://wfjpbrcktxbwasbamchx.storage.supabase.co/storage/v1/s3 
        - access key id: 9fa97b5915da906d56d6e975d2875b99
        - secret access key: 1186d2be27fbafac0941883a1c18f8d4ef1943d899d052ab3bfe0c68c74d1c95
    4. drafts (all videos that exist for that user in s3)

- configuration step:
    1. source can be auto detected or selected by dropdown.
    2. user prefills title, desc, thumbnail or its fetched depending on input
    
- distribution: 
    1. user can deploy to any channel they have added.
    2. user has the option to save to drafts after dubbing.

when user clicks execute deployment:
    the job is created.
    a notification is sent that work has began.




