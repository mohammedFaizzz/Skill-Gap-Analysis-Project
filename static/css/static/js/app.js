async function fetchSkills() {
  const res = await fetch('/api/skills');
  return res.json();
}

async function fetchRecs() {
  const res = await fetch('/api/recommendations');
  return res.json();
}

function renderChart(skills) {
  const labels = skills.map(s => s.skill);
  const avgRequired = skills.map(s => Number(s.avg_required.toFixed(2)));
  const avgCurrent = skills.map(s => Number(s.avg_current.toFixed(2)));
  const avgGap = skills.map(s => Number(s.avg_gap.toFixed(2)));

  const ctx = document.getElementById('gapChart').getContext('2d');
  if (window.gapChart) {
    window.gapChart.destroy();
  }

  window.gapChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Average Required Level',
          data: avgRequired,
          backgroundColor: 'rgba(54,162,235,0.6)',
          stack: 'a'
        },
        {
          label: 'Average Current Level',
          data: avgCurrent,
          backgroundColor: 'rgba(75,192,192,0.6)',
          stack: 'a'
        },
        {
          label: 'Average Gap',
          data: avgGap,
          type: 'line',
          borderColor: 'rgba(255,99,132,0.8)',
          backgroundColor: 'rgba(255,99,132,0.2)',
          yAxisID: 'y'
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Skill Level (1-5)' },
          suggestedMax: 5
        }
      },
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false
        }
      }
    }
  });
}

function renderRecommendations(recsJson) {
  const recs = recsJson.recommendations;
  const container = document.getElementById('recs');
  container.innerHTML = '';

  if (recs.length === 0) {
    container.innerHTML = '<p>No major skill gaps detected above threshold.</p>';
  } else {
    recs.forEach(r => {
      const div = document.createElement('div');
      div.className = 'recommendation';
      div.innerHTML = `<strong>${r.skill}</strong> — Avg gap: ${r.avg_gap} | Employees affected: ${r.employees_affected}
        <div>${r.recommendation}</div>
        <div>Estimated efficiency gain (fraction): ${r.estimated_efficiency_gain_fraction}</div>`;
      container.appendChild(div);
    });
  }

  const overall = document.getElementById('overall');
  overall.innerHTML = `<h3>Estimated overall efficiency improvement: ${recsJson.estimated_overall_efficiency_increase_percent}%</h3>`;
}

(async function init() {
  try {
    const skillsResp = await fetchSkills();
    const recsResp = await fetchRecs();

    renderChart(skillsResp.skills);
    renderRecommendations(recsResp);
  } catch (err) {
    console.error(err);
    document.getElementById('recs').innerText = 'Error fetching data';
  }
})();
