import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar /*, Pie, Radar*/ } from "react-chartjs-2";
import "./Dashboard.css";
import { useEffect, useState } from "react";
import erpLogo from "../assets/erp.png";
import { dashboardService } from "../services/dashboardService";
import { useAuthContext } from "../context/AuthContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  ChartDataLabels
);

function Dashboard() {
  const navigate = useNavigate();
  const { eventID } = useParams();
  const { User, loading: authLoading } = useAuthContext();

  // State for dashboard data
  const [dashboardData, setDashboardData] = useState(null);
  const [chartData, setChartData] = useState(null);
  // const [pieChartData, setPieChartData] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState(null);
  // const [criteriaAnalysisData, setCriteriaAnalysisData] = useState(null);
  // const [radarData, setRadarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [chartType, setChartType] = useState("bar");
  const [presentationMode, setPresentationMode] = useState(false);
  const [eventStartTime] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());

  // Settings modal state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [onlyRefereeVotes, setOnlyRefereeVotes] = useState(false);
  const [newRefereeEmail, setNewRefereeEmail] = useState("");
  const [addingReferee, setAddingReferee] = useState(false);

  const handleBackClick = () => {
    navigate("/account-overview");
  };

  const togglePresentationMode = () => {
    setPresentationMode(!presentationMode);
    if (!presentationMode) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    if (presentationMode) {
      const interval = setInterval(() => {
        setChartType((prev) => {
          if (prev === "bar") return "leaderboard";
          // if (prev === "pie") return "leaderboard";
          // if (prev === "leaderboard") return "criteria";
          // if (prev === "criteria") return "radar";
          return "bar";
        });
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [presentationMode]);

  useEffect(() => {
    if (presentationMode) {
      const interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [presentationMode]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setPresentationMode(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const formatElapsedTime = () => {
    const elapsed = Math.floor((currentTime - eventStartTime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Chart options configuration
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index",
    },
    plugins: {
      legend: {
        position: "top",
        align: "center",
        labels: {
          usePointStyle: true,
          pointStyle: "rect",
          padding: presentationMode ? 50 : 30,
          font: {
            size: presentationMode ? 32 : 20,
            weight: "600",
          },
          color: "#2C3E50",
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(44, 62, 80, 0.9)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#7FDBDA",
        borderWidth: 2,
        cornerRadius: 10,
        displayColors: true,
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(
              1
            )} pts`;
          },
        },
      },
      datalabels: {
        anchor: "end",
        align: "top",
        formatter: (value) => value.toFixed(1),
        font: {
          size: 14,
          weight: "bold",
        },
        color: "#2C3E50",
        offset: 4,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: presentationMode ? 24 : 18,
            weight: "500",
          },
          color: "#2C3E50",
          padding: 15,
          maxRotation: 45,
          minRotation: 0,
        },
        title: {
          display: true,
          text: "Evaluation Criteria",
          font: {
            size: presentationMode ? 28 : 22,
            weight: "600",
          },
          color: "#2C3E50",
          padding: 0,
        },
        categoryPercentage: 0.9,
        barPercentage: 1.0,
      },
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: "#E5E7EB",
          lineWidth: 1,
        },
        ticks: {
          font: {
            size: presentationMode ? 22 : 16,
            weight: "500",
          },
          color: "#2C3E50",
          padding: 12,
        },
        title: {
          display: true,
          text: "Average Score (Points)",
          font: {
            size: presentationMode ? 28 : 22,
            weight: "600",
          },
          color: "#2C3E50",
          padding: 25,
        },
      },
    },
    layout: {
      padding: {
        top: 20,
        bottom: 20,
        left: 10,
        right: 10,
      },
    },
    elements: {
      bar: {
        borderRadius: 8,
        borderSkipped: false,
      },
    },
  };

  // Pie chart options configuration - COMMENTED OUT
  /*
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: presentationMode ? "bottom" : "right",
        align: "center",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: presentationMode ? 30 : 20,
          font: {
            size: presentationMode ? 24 : 16,
            weight: "600",
          },
          color: "#2C3E50",
          generateLabels: function (chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const dataset = data.datasets[0];
                const backgroundColor = Array.isArray(dataset.backgroundColor)
                  ? dataset.backgroundColor[i]
                  : dataset.backgroundColor;

                return {
                  text: label,
                  fillStyle: backgroundColor,
                  strokeStyle: backgroundColor,
                  lineWidth: 2,
                  pointStyle: "circle",
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(44, 62, 80, 0.9)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#7FDBDA",
        borderWidth: 2,
        cornerRadius: 10,
        callbacks: {
          label: function (context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed.toFixed(
              1
            )} pts (${percentage}%)`;
          },
        },
      },
      datalabels: {
        display: true,
        color: "#fff",
        font: {
          size: presentationMode ? 20 : 14,
          weight: "bold",
        },
        formatter: (value, context) => {
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${percentage}%`;
        },
      },
    },
    layout: {
      padding: {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20,
      },
    },
  };
  */

  // Radar chart options configuration - COMMENTED OUT
  /*
  const radarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: presentationMode ? "bottom" : "top",
        align: "center",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: presentationMode ? 25 : 15,
          font: {
            size: presentationMode ? 20 : 14,
            weight: "600",
          },
          color: "#2C3E50",
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(44, 62, 80, 0.9)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#7FDBDA",
        borderWidth: 2,
        cornerRadius: 10,
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.r.toFixed(
              1
            )} pts`;
          },
        },
      },
      datalabels: {
        display: false,
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        grid: {
          color: "#E5E7EB",
        },
        angleLines: {
          color: "#E5E7EB",
        },
        pointLabels: {
          font: {
            size: presentationMode ? 16 : 12,
            weight: "500",
          },
          color: "#2C3E50",
        },
        ticks: {
          font: {
            size: presentationMode ? 14 : 10,
          },
          color: "#666",
          backdropColor: "rgba(255, 255, 255, 0.8)",
        },
      },
    },
    elements: {
      line: {
        borderWidth: presentationMode ? 3 : 2,
      },
      point: {
        radius: presentationMode ? 6 : 4,
        hoverRadius: presentationMode ? 8 : 6,
      },
    },
    layout: {
      padding: {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20,
      },
    },
  };
  */

  // Process vote data to create chart data
  const processVoteData = (dashboardData) => {
    if (
      !dashboardData ||
      !dashboardData.votes ||
      !dashboardData.questionnaire
    ) {
      return null;
    }

    const { votes, questionnaire, event } = dashboardData;

    // Filter votes based on settings
    const filteredVotes = onlyRefereeVotes
      ? votes.filter((vote) => vote.role === "referee")
      : votes;

    // Get all criteria from questionnaire
    const criteriaList = questionnaire.criteriaList || [];

    // Get all items (posters) from event
    const itemList = event.itemList || [];

    if (criteriaList.length === 0 || itemList.length === 0) {
      return null;
    }

    // Create a map to store aggregated scores
    const scoresByItem = {};
    const voteCountsByItem = {};

    // Initialize score tracking for each item
    itemList.forEach((item, index) => {
      const itemKey = item.PosterID || item.posterID || index;
      scoresByItem[itemKey] = {};
      voteCountsByItem[itemKey] = {};

      criteriaList.forEach((criteria) => {
        scoresByItem[itemKey][criteria.title] = 0;
        voteCountsByItem[itemKey][criteria.title] = 0;
      });
      scoresByItem[itemKey]["total"] = 0;
      voteCountsByItem[itemKey]["total"] = 0;
    });

    // Process each vote
    filteredVotes.forEach((vote) => {
      const itemKey = vote.itemID;
      if (!scoresByItem[itemKey]) return;

      let voteTotal = 0;

      // Process each answer in the vote
      vote.ticketOptionsList.forEach((answer) => {
        const criteriaTitle = answer.questionTitle;
        const points = answer.points || 0;

        // Find matching criteria
        const matchingCriteria = criteriaList.find((criteria) =>
          criteria.questionList.some((q) => q.title === criteriaTitle)
        );

        if (matchingCriteria) {
          scoresByItem[itemKey][matchingCriteria.title] += points;
          voteCountsByItem[itemKey][matchingCriteria.title]++;
          voteTotal += points;
        }
      });

      scoresByItem[itemKey]["total"] += voteTotal;
      voteCountsByItem[itemKey]["total"]++;
    });

    // Calculate averages and prepare chart data
    const labels = [...criteriaList.map((c) => c.title), "Total Score"];
    const datasets = [];
    const colors = [
      "#4A90E2",
      "#F39C12",
      "#8E44AD",
      "#E74C3C",
      "#2ECC71",
      "#16A085",
      "#D35400",
      "#C0392B",
      "#7D3C98",
      "#1ABC9C",
    ];

    itemList.forEach((item, index) => {
      const itemKey = item.PosterID || item.posterID || index;
      const itemTitle = item.Title || item.title || `Poster ${index + 1}`;

      const data = [];

      // Calculate average scores for each criteria
      criteriaList.forEach((criteria) => {
        const totalScore = scoresByItem[itemKey][criteria.title];
        const voteCount = voteCountsByItem[itemKey][criteria.title];
        const average = voteCount > 0 ? totalScore / voteCount : 0;
        data.push(average);
      });

      // Calculate total average
      const totalScore = scoresByItem[itemKey]["total"];
      const totalVotes = voteCountsByItem[itemKey]["total"];
      const totalAverage = totalVotes > 0 ? totalScore / totalVotes : 0;
      data.push(totalAverage);

      datasets.push({
        label: itemTitle,
        data: data,
        backgroundColor: colors[index % colors.length],
        borderColor: colors[index % colors.length],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      });
    });

    return {
      labels,
      datasets,
    };
  };

  // Process vote data to create pie chart data - COMMENTED OUT
  /*
  const processPieChartData = (dashboardData) => {
    if (
      !dashboardData ||
      !dashboardData.votes ||
      !dashboardData.questionnaire
    ) {
      return null;
    }

    const { votes, event } = dashboardData;

    // Get all items (posters) from event
    const itemList = event.itemList || [];

    if (itemList.length === 0) {
      return null;
    }

    // Create a map to store total scores for each item
    const totalScoresByItem = {};
    const voteCountsByItem = {};

    // Initialize score tracking for each item
    itemList.forEach((item, index) => {
      const itemKey = item.PosterID || item.posterID || index;
      totalScoresByItem[itemKey] = 0;
      voteCountsByItem[itemKey] = 0;
    });

    // Process each vote to calculate total scores per item
    votes.forEach((vote) => {
      const itemKey = vote.itemID;
      if (totalScoresByItem[itemKey] === undefined) return;

      let voteTotal = 0;

      // Sum all points from this vote
      vote.ticketOptionsList.forEach((answer) => {
        const points = answer.points || 0;
        voteTotal += points;
      });

      totalScoresByItem[itemKey] += voteTotal;
      voteCountsByItem[itemKey]++;
    });

    // Calculate average scores and prepare pie chart data
    const labels = [];
    const data = [];
    const backgroundColors = [
      "#4A90E2",
      "#F39C12",
      "#8E44AD",
      "#E74C3C",
      "#2ECC71",
      "#16A085",
      "#D35400",
      "#C0392B",
      "#7D3C98",
      "#1ABC9C",
    ];

    itemList.forEach((item, index) => {
      const itemKey = item.PosterID || item.posterID || index;
      const itemTitle = item.Title || item.title || `Poster ${index + 1}`;

      const totalScore = totalScoresByItem[itemKey];
      const voteCount = voteCountsByItem[itemKey];
      const averageScore = voteCount > 0 ? totalScore / voteCount : 0;

      if (averageScore > 0) {
        labels.push(itemTitle);
        data.push(averageScore);
      }
    });

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors.slice(0, data.length),
          borderColor: backgroundColors.slice(0, data.length),
          borderWidth: 2,
          hoverOffset: 10,
        },
      ],
    };
  };
  */

  // Process vote data to create leaderboard data
  const processLeaderboardData = (dashboardData) => {
    if (
      !dashboardData ||
      !dashboardData.votes ||
      !dashboardData.questionnaire
    ) {
      return null;
    }

    const { votes, event, questionnaire } = dashboardData;

    // Filter votes based on settings
    const filteredVotes = onlyRefereeVotes
      ? votes.filter((vote) => vote.role === "referee")
      : votes;
    const itemList = event.itemList || [];

    if (itemList.length === 0) {
      return null;
    }

    // Calculate maximum possible score with safety checks
    const criteriaList = questionnaire.criteriaList || [];
    let maxPossibleScore = 0;
    criteriaList.forEach((criteria) => {
      if (criteria.questionList && Array.isArray(criteria.questionList)) {
        criteria.questionList.forEach((question) => {
          if (
            question.optionsList &&
            Array.isArray(question.optionsList) &&
            question.optionsList.length > 0
          ) {
            const maxPoints = Math.max(
              ...question.optionsList.map((opt) => opt.points || 0)
            );
            maxPossibleScore += maxPoints;
          }
        });
      }
    });

    // Fallback for maxPossibleScore if calculation fails
    if (maxPossibleScore === 0 && filteredVotes.length > 0) {
      // Estimate from actual vote data
      const sampleVote = filteredVotes[0];
      if (sampleVote && sampleVote.ticketOptionsList) {
        maxPossibleScore = sampleVote.ticketOptionsList.length * 5; // Assume max 5 points per question as fallback
      }
    }

    // Create a map to store total scores for each item
    const posterStats = {};

    // Initialize score tracking for each item
    itemList.forEach((item, index) => {
      const itemKey = item.PosterID || item.posterID || index;
      posterStats[itemKey] = {
        posterID: itemKey,
        posterName: item.Title || item.title || `Poster ${index + 1}`,
        totalScore: 0,
        voteCount: 0,
        averageScore: 0,
        scorePercentage: 0,
        rank: 0,
      };
    });

    // Process each vote to calculate total scores per item
    filteredVotes.forEach((vote) => {
      const itemKey = vote.itemID;
      if (!posterStats[itemKey]) return;

      let voteTotal = 0;

      // Sum all points from this vote
      if (vote.ticketOptionsList && Array.isArray(vote.ticketOptionsList)) {
        vote.ticketOptionsList.forEach((answer) => {
          const points = answer.points || 0;
          voteTotal += points;
        });
      }

      posterStats[itemKey].totalScore += voteTotal;
      posterStats[itemKey].voteCount++;
    });

    // Calculate averages and percentages
    Object.values(posterStats).forEach((poster) => {
      if (poster.voteCount > 0) {
        poster.averageScore = poster.totalScore / poster.voteCount;
        poster.scorePercentage =
          maxPossibleScore > 0
            ? (poster.averageScore / maxPossibleScore) * 100
            : 0;
      }
    });

    // Sort by average score and assign ranks
    const sortedPosters = Object.values(posterStats)
      .filter((poster) => poster.voteCount > 0)
      .sort((a, b) => b.averageScore - a.averageScore)
      .map((poster, index) => ({
        ...poster,
        rank: index + 1,
      }));

    return {
      posters: sortedPosters,
      maxPossibleScore,
      totalParticipants: participantCount,
    };
  };

  // Process criteria analysis data - COMMENTED OUT
  /*
  const processCriteriaAnalysisData = (dashboardData) => {
    if (
      !dashboardData ||
      !dashboardData.votes ||
      !dashboardData.questionnaire
    ) {
      return null;
    }

    const { votes, questionnaire } = dashboardData;
    const criteriaList = questionnaire.criteriaList || [];

    if (criteriaList.length === 0) {
      return null;
    }

    const criteriaScores = {};
    const criteriaVoteCounts = {};
    const criteriaQuestionCounts = {};

    criteriaList.forEach((criteria) => {
      criteriaScores[criteria.title] = 0;
      criteriaVoteCounts[criteria.title] = 0;
      criteriaQuestionCounts[criteria.title] = criteria.questionList.length;
    });

    votes.forEach((vote) => {
      vote.ticketOptionsList.forEach((answer) => {
        const questionTitle = answer.questionTitle;
        const points = answer.points || 0;

        const matchingCriteria = criteriaList.find((criteria) =>
          criteria.questionList.some((q) => q.title === questionTitle)
        );

        if (matchingCriteria) {
          criteriaScores[matchingCriteria.title] += points;
          criteriaVoteCounts[matchingCriteria.title]++;
        }
      });
    });

    const criteriaAnalysis = criteriaList.map((criteria) => {
      const totalScore = criteriaScores[criteria.title];
      const voteCount = criteriaVoteCounts[criteria.title];
      const questionCount = criteriaQuestionCounts[criteria.title];
      const averageScore = voteCount > 0 ? totalScore / voteCount : 0;

      return {
        name: criteria.title,
        averageScore: averageScore,
        totalVotes: voteCount,
        questionCount: questionCount,
        scorePerQuestion: questionCount > 0 ? averageScore / questionCount : 0,
      };
    });

    criteriaAnalysis.sort((a, b) => b.averageScore - a.averageScore);

    return {
      criteriaData: criteriaAnalysis,
      bestCriteria: criteriaAnalysis[0] || null,
      worstCriteria: criteriaAnalysis[criteriaAnalysis.length - 1] || null,
      totalCriteria: criteriaAnalysis.length,
    };
  };
  */

  // Process radar chart data - COMMENTED OUT
  /*
  const processRadarData = (dashboardData) => {
    if (
      !dashboardData ||
      !dashboardData.votes ||
      !dashboardData.questionnaire
    ) {
      return null;
    }

    const { votes, questionnaire, event } = dashboardData;
    const criteriaList = questionnaire.criteriaList || [];
    const itemList = event.itemList || [];

    if (criteriaList.length === 0 || itemList.length === 0) {
      return null;
    }

    const scoresByItem = {};
    const voteCountsByItem = {};

    itemList.forEach((item, index) => {
      const itemKey = item.PosterID || item.posterID || index;
      scoresByItem[itemKey] = {
        name: item.Title || item.title || `Poster ${index + 1}`,
        scores: {},
      };
      voteCountsByItem[itemKey] = {};

      criteriaList.forEach((criteria) => {
        scoresByItem[itemKey].scores[criteria.title] = 0;
        voteCountsByItem[itemKey][criteria.title] = 0;
      });
    });

    // Process votes
    votes.forEach((vote) => {
      const itemKey = vote.itemID;
      if (!scoresByItem[itemKey]) return;

      vote.ticketOptionsList.forEach((answer) => {
        const criteriaTitle = answer.questionTitle;
        const points = answer.points || 0;

        const matchingCriteria = criteriaList.find((criteria) =>
          criteria.questionList.some((q) => q.title === criteriaTitle)
        );

        if (matchingCriteria) {
          scoresByItem[itemKey].scores[matchingCriteria.title] += points;
          voteCountsByItem[itemKey][matchingCriteria.title]++;
        }
      });
    });

    const labels = criteriaList.map((c) => c.title);
    const datasets = [];
    const colors = [
      "#4A90E2",
      "#F39C12",
      "#8E44AD",
      "#E74C3C",
      "#2ECC71",
      "#16A085",
      "#D35400",
      "#C0392B",
      "#7D3C98",
      "#1ABC9C",
    ];

    itemList.forEach((item, index) => {
      const itemKey = item.PosterID || item.posterID || index;
      if (!scoresByItem[itemKey]) return;

      const data = [];
      criteriaList.forEach((criteria) => {
        const totalScore = scoresByItem[itemKey].scores[criteria.title];
        const voteCount = voteCountsByItem[itemKey][criteria.title];
        const average = voteCount > 0 ? totalScore / voteCount : 0;
        data.push(average);
      });

      if (data.some((score) => score > 0)) {
        datasets.push({
          label: scoresByItem[itemKey].name,
          data: data,
          borderColor: colors[index % colors.length],
          backgroundColor: colors[index % colors.length] + "20",
          borderWidth: presentationMode ? 3 : 2,
          pointBackgroundColor: colors[index % colors.length],
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: presentationMode ? 6 : 4,
        });
      }
    });

    return {
      labels,
      datasets,
    };
  };
  */

  // Helper functions for leaderboard display
  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "#2ECC71"; // Green
    if (percentage >= 60) return "#F39C12"; // Orange
    if (percentage >= 40) return "#E74C3C"; // Red
    return "#95A5A6"; // Gray
  };

  const getMedalIcon = (rank) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${rank}`;
    }
  };

  const formatScore = (score) => {
    return score.toFixed(1);
  };

  const processDashboardData = (data) => {
    setDashboardData(data);

    const processedChartData = processVoteData(data);
    setChartData(processedChartData);

    // const processedPieChartData = processPieChartData(data);
    // setPieChartData(processedPieChartData);

    const processedLeaderboardData = processLeaderboardData(data);
    setLeaderboardData(processedLeaderboardData);

    // const processedCriteriaAnalysisData = processCriteriaAnalysisData(data);
    // setCriteriaAnalysisData(processedCriteriaAnalysisData);

    // const processedRadarData = processRadarData(data);
    // setRadarData(processedRadarData);

    const uniqueVoters = new Set();
    if (data.votes) {
      const votesToCount = onlyRefereeVotes
        ? data.votes.filter((vote) => vote.role === "referee")
        : data.votes;

      votesToCount.forEach((vote) => {
        if (vote.role === "referee" && vote.refereeEmail) {
          uniqueVoters.add(vote.refereeEmail);
        } else {
          uniqueVoters.add(vote.voteID);
        }
      });
    }
    setParticipantCount(uniqueVoters.size);
    setLoading(false);
    setError(null);
  };

  const handleRealtimeError = (errorMessage) => {
    setError(errorMessage);
    setLoading(false);
  };

  // Handle event start
  const handleBegin = async () => {
    try {
      const res = await fetch(
        `https://eventrate-pro.de/dashboard/startEvent?eventID=${eventID}`,
        {
          method: "POST",
        }
      );
      const data = await res.json();
      if (res.ok) {
        alert("Event started successfully!");
      } else {
        alert("Failed to start event: " + data.error);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("An error occurred while starting the event.");
    }
  };

  // Handle event end
  const handleEnd = async () => {
    try {
      const res = await fetch(
        `https://eventrate-pro.de/dashboard/endEvent?eventID=${eventID}`,
        {
          method: "POST",
        }
      );
      const data = await res.json();
      if (res.ok) {
        alert("Event has ended successfully!");
      } else {
        alert("Failed to end event: " + data.error);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("An error occurred while ending the event.");
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => setLoading(false), 1000);
  };

  // Settings modal handlers
  const openSettingsModal = () => {
    setShowSettingsModal(true);
  };

  const closeSettingsModal = () => {
    setShowSettingsModal(false);
    setNewRefereeEmail("");
  };

  const handleAddReferee = async () => {
    if (!newRefereeEmail.trim()) {
      alert("Please enter a valid email address.");
      return;
    }

    setAddingReferee(true);
    try {
      const response = await fetch(
        `https://eventrate-pro.de/event/addRefereeToList?email=${newRefereeEmail.trim()}`
      );

      const data = await response.json();
      if (data.status === "success") {
        alert("Referee added successfully!");
        setNewRefereeEmail("");
      } else {
        const errorMessage = data.message
          ? data.message.replace(/User/g, "Referee")
          : "Referee email not found in the system";
        alert("Failed to add referee: " + errorMessage);
      }
    } catch (error) {
      console.error("Error adding referee:", error);
      alert("An error occurred while adding the referee.");
    } finally {
      setAddingReferee(false);
    }
  };

  // Handle Excel export
  const handleExcelExport = async () => {
    if (!dashboardData || !dashboardData.votes) {
      alert("No data available for export.");
      return;
    }

    try {
      // Create CSV data
      const csvData = [];
      csvData.push([
        "Vote ID",
        "Item ID",
        "Participant",
        "Question",
        "Answer",
        "Points",
        "Timestamp",
      ]);

      dashboardData.votes.forEach((vote) => {
        vote.ticketOptionsList.forEach((answer) => {
          csvData.push([
            vote.voteID,
            vote.itemID,
            vote.role === "referee"
              ? vote.refereeEmail || "Authenticated User"
              : "Anonymous",
            answer.questionTitle,
            answer.label,
            answer.points,
            new Date().toISOString(), // You might want to add actual timestamp to vote data
          ]);
        });
      });

      // Convert to CSV string
      const csvContent = csvData.map((row) => row.join(",")).join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `event-${eventID}-results.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export data.");
    }
  };

  useEffect(() => {
    // Wait for authentication to complete and ensure we have both eventID and authenticated user
    if (!eventID || authLoading || !User) {
      return;
    }

    dashboardService.subscribeToEventData(
      eventID,
      processDashboardData,
      handleRealtimeError
    );

    return () => {
      dashboardService.unsubscribe();
    };
  }, [eventID, User, authLoading]);

  // Regenerate chart data when filter settings change
  useEffect(() => {
    if (dashboardData) {
      processDashboardData(dashboardData);
    }
  }, [onlyRefereeVotes]);

  // Render loading state
  if ((loading && !dashboardData) || authLoading) {
    return (
      <div className="dashboard-page">
        <div className="back-arrow" onClick={handleBackClick}>
          ← Back
        </div>
        <div className="logo-header">
          <img src={erpLogo} alt="ERP Logo" className="center-logo" />
        </div>
        <div className="dashboard-content">
          <div className="dashboard-card">
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div>Loading dashboard data...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="dashboard-page">
        <div className="back-arrow" onClick={handleBackClick}>
          ← Back
        </div>
        <div className="logo-header">
          <img src={erpLogo} alt="ERP Logo" className="center-logo" />
        </div>
        <div className="dashboard-content">
          <div className="dashboard-card">
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div style={{ color: "red", marginBottom: "1rem" }}>
                Error: {error}
              </div>
              <button onClick={handleRefresh} className="action-btn">
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`dashboard-page ${
        presentationMode ? "presentation-mode" : ""
      }`}
    >
      {!presentationMode && (
        <>
          <div className="back-arrow" onClick={handleBackClick}>
            ← Back
          </div>
          <div className="logo-header">
            <img src={erpLogo} alt="ERP Logo" className="center-logo" />
          </div>
        </>
      )}

      {presentationMode && (
        <div className="presentation-header">
          <div className="presentation-logo">
            <img
              src={erpLogo}
              alt="ERP Logo"
              className="presentation-logo-img"
            />
            <h1 className="presentation-title">
              Event Dashboard - Live Results
            </h1>
          </div>
          <div className="presentation-info">
            <div className="presentation-timer">
              ⏱️ Event Time: {formatElapsedTime()}
            </div>
            <div className="presentation-participants">
              👥 Live Participants: {participantCount}
            </div>
            <div className="presentation-chart-indicator">
              📊{" "}
              {chartType === "bar"
                ? "Detailed Scores"
                : /* chartType === "pie"
                ? "Overall Rankings"
                : */ chartType === "leaderboard"
                ? "Live Leaderboard"
                : /* chartType === "criteria"
                ? "Criteria Analysis"
                : */ "Multi-Criteria Analysis"}
            </div>
          </div>
        </div>
      )}

      {presentationMode && (
        <div className="presentation-actions">
          <button
            className="exit-presentation-btn"
            onClick={togglePresentationMode}
          >
            ✖
          </button>
        </div>
      )}

      <div className="dashboard-content">
        <div
          className={`dashboard-card ${
            presentationMode ? "presentation-card" : ""
          }`}
        >
          {!presentationMode && (
            <div className="participant-count">
              <h2>NUMBER OF PARTICIPANTS: {participantCount}</h2>
            </div>
          )}

          {!presentationMode && (
            <div className="chart-controls">
              <div className="chart-type-toggle">
                <button
                  className={`toggle-btn ${
                    chartType === "bar" ? "active" : ""
                  }`}
                  onClick={() => setChartType("bar")}
                >
                  📊 Bar Chart
                </button>
                {/* COMMENTED OUT - PIE CHART
                <button
                  className={`toggle-btn ${
                    chartType === "pie" ? "active" : ""
                  }`}
                  onClick={() => setChartType("pie")}
                >
                  🥧 Pie Chart
                </button>
                */}
                <button
                  className={`toggle-btn ${
                    chartType === "leaderboard" ? "active" : ""
                  }`}
                  onClick={() => setChartType("leaderboard")}
                >
                  🏆 Leaderboard
                </button>
                {/* COMMENTED OUT - CRITERIA ANALYSIS
                <button
                  className={`toggle-btn ${
                    chartType === "criteria" ? "active" : ""
                  }`}
                  onClick={() => setChartType("criteria")}
                >
                  📊 Criteria Analysis
                </button>
                */}
                {/* COMMENTED OUT - RADAR CHART
                <button
                  className={`toggle-btn ${
                    chartType === "radar" ? "active" : ""
                  }`}
                  onClick={() => setChartType("radar")}
                >
                  🎯 Radar Chart
                </button>
                */}
              </div>
            </div>
          )}

          <div className="chart-container">
            {chartType === "bar" ? (
              chartData ? (
                <Bar data={chartData} options={chartOptions} />
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "#666",
                    minHeight: "400px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {dashboardData?.votes?.length === 0
                    ? "No votes have been submitted yet."
                    : "Loading chart data..."}
                </div>
              )
            ) : /* COMMENTED OUT - PIE CHART: chartType === "pie" ? (...) : */ chartType ===
              "leaderboard" ? (
              leaderboardData && leaderboardData.posters.length > 0 ? (
                <div className="leaderboard-container">
                  <div className="leaderboard-header">
                    <h2
                      className={`leaderboard-title ${
                        presentationMode ? "presentation-title" : ""
                      }`}
                    >
                      🏆 Live Leaderboard
                    </h2>
                  </div>

                  <div className="leaderboard-list">
                    {leaderboardData.posters
                      .slice(0, presentationMode ? 8 : 10)
                      .map((poster) => (
                        <div
                          key={poster.posterID}
                          className={`leaderboard-item ${
                            presentationMode ? "presentation-item" : ""
                          } ${poster.rank <= 3 ? "top-three" : ""}`}
                        >
                          <div className="rank-badge">
                            <span className="rank-icon">
                              {getMedalIcon(poster.rank)}
                            </span>
                          </div>

                          <div className="poster-info">
                            <h3 className="poster-name">{poster.posterName}</h3>
                            <div className="poster-details">
                              <span className="vote-count">
                                {poster.voteCount} votes
                              </span>
                              <span className="score-text">
                                {formatScore(poster.averageScore)} /{" "}
                                {formatScore(leaderboardData.maxPossibleScore)}{" "}
                                pts
                              </span>
                            </div>
                          </div>

                          <div className="score-circle-container">
                            <div
                              className="score-circle"
                              style={{
                                background: `conic-gradient(${getScoreColor(
                                  poster.scorePercentage
                                )} ${
                                  poster.scorePercentage * 3.6
                                }deg, #e0e0e0 0deg)`,
                              }}
                            >
                              <div className="score-inner">
                                <span className="score-percentage">
                                  {Math.round(poster.scorePercentage)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {leaderboardData.posters.length >
                    (presentationMode ? 8 : 10) && (
                    <div
                      className={`leaderboard-footer ${
                        presentationMode ? "presentation-footer" : ""
                      }`}
                    >
                      <span>
                        +
                        {leaderboardData.posters.length -
                          (presentationMode ? 8 : 10)}{" "}
                        more posters
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "#666",
                    minHeight: "400px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {dashboardData?.votes?.length === 0
                    ? "No votes have been submitted yet."
                    : "Loading leaderboard data..."}
                </div>
              )
            ) : (
              /* COMMENTED OUT - CRITERIA ANALYSIS
            chartType === "criteria" ? (
              criteriaAnalysisData &&
              criteriaAnalysisData.criteriaData.length > 0 ? (
                <div className="criteria-analysis-container">
                  <div className="criteria-analysis-header">
                    <h2
                      className={`criteria-analysis-title ${
                        presentationMode ? "presentation-title" : ""
                      }`}
                    >
                      📊 Criteria Performance Analysis
                    </h2>
                    <div
                      className={`criteria-analysis-summary ${
                        presentationMode ? "presentation-summary" : ""
                      }`}
                    >
                      <div className="summary-item best">
                        <span className="summary-icon">🏆</span>
                        <div className="summary-content">
                          <div className="summary-label">Best Performing</div>
                          <div className="summary-value">
                            {criteriaAnalysisData.bestCriteria?.name}
                          </div>
                          <div className="summary-score">
                            {criteriaAnalysisData.bestCriteria?.averageScore.toFixed(
                              1
                            )}{" "}
                            avg
                          </div>
                        </div>
                      </div>
                      <div className="summary-item worst">
                        <span className="summary-icon">📉</span>
                        <div className="summary-content">
                          <div className="summary-label">Needs Improvement</div>
                          <div className="summary-value">
                            {criteriaAnalysisData.worstCriteria?.name}
                          </div>
                          <div className="summary-score">
                            {criteriaAnalysisData.worstCriteria?.averageScore.toFixed(
                              1
                            )}{" "}
                            avg
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="criteria-chart-container">
                    <div className="criteria-bars">
                      {criteriaAnalysisData.criteriaData.map(
                        (criteria, index) => {
                          const maxScore = Math.max(
                            ...criteriaAnalysisData.criteriaData.map(
                              (c) => c.averageScore
                            )
                          );
                          const percentage =
                            maxScore > 0
                              ? (criteria.averageScore / maxScore) * 100
                              : 0;
                          const isFirst = index === 0;
                          const isLast =
                            index ===
                            criteriaAnalysisData.criteriaData.length - 1;

                          return (
                            <div
                              key={index}
                              className={`criteria-bar-item ${
                                isFirst ? "best" : isLast ? "worst" : ""
                              }`}
                            >
                              <div className="criteria-bar-header">
                                <span className="criteria-name">
                                  {criteria.name}
                                </span>
                                <span className="criteria-score">
                                  {criteria.averageScore.toFixed(1)}
                                </span>
                              </div>
                              <div className="criteria-bar-track">
                                <div
                                  className="criteria-bar-fill"
                                  style={{
                                    width: `${percentage}%`,
                                    backgroundColor: isFirst
                                      ? "#4CAF50"
                                      : isLast
                                      ? "#f44336"
                                      : "#2196F3",
                                  }}
                                ></div>
                              </div>
                              <div className="criteria-details">
                                <span className="vote-count">
                                  {criteria.totalVotes} votes
                                </span>
                                <span className="question-count">
                                  {criteria.questionCount} questions
                                </span>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "#666",
                    minHeight: "400px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {dashboardData?.votes?.length === 0
                    ? "No votes have been submitted yet."
                    : "Loading criteria analysis data..."}
                </div>
              )
            ) : chartType === "radar" ? (
              radarData && radarData.datasets.length > 0 ? (
                <Radar data={radarData} options={radarChartOptions} />
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "#666",
                    minHeight: "400px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {dashboardData?.votes?.length === 0
                    ? "No votes have been submitted yet."
                    : "Loading radar chart data..."}
                </div>
              )
            ) : */ <div
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  color: "#666",
                  minHeight: "400px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Chart type not available
              </div>
            )}
          </div>

          {!presentationMode && (
            <div className="action-buttons">
              {dashboardData?.event?.status === "pending" && (
                <button className="action-btn begin-btn" onClick={handleBegin}>
                  Begin
                </button>
              )}
              <button className="action-btn end-btn" onClick={handleEnd}>
                End
              </button>
              <button
                className="action-btn excel-btn"
                onClick={handleExcelExport}
              >
                Excel
              </button>
              <button
                className="action-btn presentation-btn"
                onClick={togglePresentationMode}
              >
                🖥️ Presentation Mode
              </button>
              <button
                className="action-btn settings-btn"
                onClick={openSettingsModal}
              >
                ⚙️ Settings
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="settings-modal-overlay" onClick={closeSettingsModal}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-header">
              <h2>⚙️ Dashboard Settings</h2>
              <button className="close-btn" onClick={closeSettingsModal}>
                ✖
              </button>
            </div>

            <div className="settings-content">
              {/* Only Show Referee Votes Toggle */}
              <div className="setting-item">
                <div className="setting-label">
                  <span>Only Show Referee Votes</span>
                  <small>Filter results to show only votes from referees</small>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={onlyRefereeVotes}
                    onChange={(e) => setOnlyRefereeVotes(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              {/* Add Referee Section */}
              <div className="setting-item add-referee-section">
                <div className="setting-label">
                  <span>Add New Referee</span>
                  <small>Add a referee even after the event has started</small>
                </div>
                <div className="add-referee-form">
                  <input
                    type="email"
                    placeholder="Enter referee email address"
                    value={newRefereeEmail}
                    onChange={(e) => setNewRefereeEmail(e.target.value)}
                    className="referee-email-input"
                  />
                  <button
                    className="add-referee-btn"
                    onClick={handleAddReferee}
                    disabled={addingReferee || !newRefereeEmail.trim()}
                  >
                    {addingReferee ? "Adding..." : "Add Referee"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
