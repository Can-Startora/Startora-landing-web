import { execSync } from 'child_process';

export const getRepoStats = async (req, res) => {
  try {
    const repoRes = await fetch('https://api.github.com/repos/Manvikamboz/Startora', {
      headers: { 'User-Agent': 'Startora-App' }
    });
    const contribsRes = await fetch('https://api.github.com/repos/Manvikamboz/Startora/contributors', {
      headers: { 'User-Agent': 'Startora-App' }
    });
    
    let stargazers = 0;
    let forks = 0;
    let openIssues = 0;
    let contributorsList = [];

    if (repoRes.ok) {
      const repoData = await repoRes.json();
      stargazers = repoData.stargazers_count;
      forks = repoData.forks_count;
      openIssues = repoData.open_issues_count;
    }
    if (contribsRes.ok) {
      contributorsList = await contribsRes.json();
    }

    let commitsCount = 0;
    try {
      commitsCount = parseInt(execSync('git rev-list --count HEAD').toString().trim(), 10);
    } catch (e) {
      commitsCount = 6;
    }

    let contributors = [];
    if (Array.isArray(contributorsList) && contributorsList.length > 0) {
      contributors = contributorsList.map(c => ({
        name: c.login === 'Manvikamboz' ? 'Manvi Kamboz' : c.login,
        handle: c.login,
        avatar: c.avatar_url,
        role: c.login === 'Manvikamboz' ? 'Lead Architect' : 'Contributor',
        university: c.login === 'Manvikamboz' ? 'Founder & Lead' : 'GitHub Builder',
        contributions: c.contributions
      }));
    } else {
      contributors = [
        {
          name: "Manvi Kamboz",
          handle: "Manvikamboz",
          avatar: "https://avatars.githubusercontent.com/u/178479748?v=4",
          role: "Lead Architect",
          university: "Founder & Lead",
          contributions: 1
        }
      ];
    }

    let recentCommits = [];
    try {
      const gitCommitsRes = await fetch('https://api.github.com/repos/Manvikamboz/Startora/commits?per_page=5', {
        headers: { 'User-Agent': 'Startora-App' }
      });
      if (gitCommitsRes.ok) {
        const githubCommits = await gitCommitsRes.json();
        if (Array.isArray(githubCommits)) {
          recentCommits = githubCommits.slice(0, 5).map(c => ({
            sha: c.sha.substring(0, 7),
            author: c.commit.author.name,
            message: c.commit.message.split('\n')[0],
            date: c.commit.author.date
          }));
        }
      }
    } catch (err) {
      console.warn('GitHub commits API failed, falling back to local git history:', err);
    }

    if (recentCommits.length === 0) {
      try {
        const gitLog = execSync('git log -n 5 --pretty=format:"%h|%an|%ar|%s"').toString().trim();
        recentCommits = gitLog.split('\n').map(line => {
          const [sha, author, date, message] = line.split('|');
          return { sha, author, date, message };
        });
      } catch (e) {
        recentCommits = [
          { sha: "09aa6c4", author: "Manvi Kamboz", date: "just now", message: "update contributor constellation with dynamic github api repo-stats" }
        ];
      }
    }

    let openIssuesList = [];
    try {
      const issuesRes = await fetch('https://api.github.com/repos/Manvikamboz/Startora/issues?state=open&per_page=3', {
        headers: { 'User-Agent': 'Startora-App' }
      });
      if (issuesRes.ok) {
        const issuesData = await issuesRes.json();
        if (Array.isArray(issuesData)) {
          openIssuesList = issuesData
            .filter(issue => !issue.pull_request)
            .map(issue => ({
              number: issue.number,
              title: issue.title,
              url: issue.html_url,
              labels: issue.labels.map(l => l.name),
              comments: issue.comments,
              updatedAt: issue.updated_at
            }));
        }
      }
    } catch (err) {
      console.warn('GitHub issues API fetch failed:', err);
    }

    res.json({
      stargazers,
      forks,
      openIssues,
      commitsCount,
      contributorsCount: contributors.length,
      contributors,
      recentCommits,
      openIssuesList
    });
  } catch (err) {
    console.error('Error fetching repo stats:', err);
    let commitsCount = 6;
    let recentCommits = [];
    try {
      commitsCount = parseInt(execSync('git rev-list --count HEAD').toString().trim(), 10);
      const gitLog = execSync('git log -n 5 --pretty=format:"%h|%an|%ar|%s"').toString().trim();
      recentCommits = gitLog.split('\n').map(line => {
        const [sha, author, date, message] = line.split('|');
        return { sha, author, date, message };
      });
    } catch (e) {
      recentCommits = [
        { sha: "09aa6c4", author: "Manvi Kamboz", date: "just now", message: "update contributor constellation with dynamic github api repo-stats" }
      ];
    }

    res.json({
      stargazers: 0,
      forks: 0,
      openIssues: 0,
      commitsCount,
      contributorsCount: 1,
      contributors: [
        {
          name: "Manvi Kamboz",
          handle: "Manvikamboz",
          avatar: "https://avatars.githubusercontent.com/u/178479748?v=4",
          role: "Lead Architect",
          university: "Founder & Lead",
          contributions: 1
        }
      ],
      recentCommits
    });
  }
};
