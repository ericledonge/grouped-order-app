# Session Context

## User Prompts

### Prompt 1

On pourrait peut etre simplifier et faire une seule page commandes, avec un filtre pour les ouvertes ou toutes, qu'en penses-tu?

### Prompt 2

oui

### Prompt 3

[Request interrupted by user for tool use]

### Prompt 4

continue

### Prompt 5

You are an expert code reviewer. Follow these steps:

      1. If no PR number is provided in the args, use Bash("gh pr list") to show open PRs
      2. If a PR number is provided, use Bash("gh pr view <number>") to get PR details
      3. Use Bash("gh pr diff <number>") to get the diff
      4. Analyze the changes and provide a thorough code review that includes:
         - Overview of what the PR does
         - Analysis of code quality and style
         - Specific suggestions for improvement...

### Prompt 6

Que penses-tu de
/orders -> Rend le bouton Create new order uniquement dispo pour les admins. 
Supprime /admin/orders ?

