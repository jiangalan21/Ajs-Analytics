This is my repo.
I decided to configure my deploy with GitHub Actions because it is relatively simple to setup as it is directly on GitHub.

First, I needed to setup an SSH key for my server to be able to commit changes to the repo.
Next, I set up a key for the repo to do things on my server.
Then, I set up secret variables about the server's details like IP address and details about my user.
Finally, I created a .yaml file that defines the workflow procedures which SSH into the server with my user details and then runs a script to restart apache so the changes can be seen on the site.