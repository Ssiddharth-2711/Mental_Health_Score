

const API_URL = "https://mental-health-score-vyoc.onrender.com";


const MIN_SCORE = 0;
const MAX_SCORE = 10;



const form = document.getElementById("predictionForm");

const predictBtn = document.getElementById("predictBtn");

const resultCard = document.getElementById("resultCard");

const simulationOverlay =
    document.getElementById("simulationOverlay");

const progressFill =
    document.getElementById("progressFill");

const simulationText =
    document.getElementById("simulationText");

const scoreValue =
    document.getElementById("scoreValue");

const gaugeProgress =
    document.getElementById("gaugeProgress");

const gaugeNeedle =
    document.getElementById("gaugeNeedle");

const againBtn =
    document.getElementById("againBtn");

const errorToast =
    document.getElementById("errorToast");

const errorMessage =
    document.getElementById("errorMessage");

const closeError =
    document.getElementById("closeError");




const GAUGE_LENGTH = 502.65;




function getFormData() {

    return {

        age: Number(
            document.getElementById("age").value
        ),

        gender:
            document.getElementById("gender").value,

        country:
            document.getElementById("country").value,

        academic_level:
            document.getElementById("academic_level").value,

        most_used_platform:
            document.getElementById("most_used_platform").value,

        purpose_of_use:
            document.getElementById("purpose_of_use").value,

        avg_daily_usage_hours:
            Number(
                document.getElementById(
                    "avg_daily_usage_hours"
                ).value
            ),

        daily_unlocks:
            Number(
                document.getElementById(
                    "daily_unlocks"
                ).value
            ),

        study_hours:
            Number(
                document.getElementById(
                    "study_hours"
                ).value
            ),

        physical_activity_hours:
            Number(
                document.getElementById(
                    "physical_activity_hours"
                ).value
            ),

        sleep_hours_per_night:
            Number(
                document.getElementById(
                    "sleep_hours_per_night"
                ).value
            ),

        stress_level:
            document.getElementById(
                "stress_level"
            ).value
    };
}




function runSimulation() {

    return new Promise((resolve) => {

        simulationOverlay.classList.add("active");

        progressFill.style.width = "0%";

        resetSimulationSteps();


        const stages = [

            {
                progress: 20,
                text: "Preparing input...",
                step: "step1"
            },

            {
                progress: 45,
                text: "Sending data to prediction API...",
                step: "step2"
            },

            {
                progress: 72,
                text: "Processing model output...",
                step: "step3"
            },

            {
                progress: 94,
                text: "Finalizing prediction...",
                step: "step4"
            }

        ];


        let currentStage = 0;


        function nextStage() {

            if (currentStage >= stages.length) {

                resolve();

                return;
            }


            const stage = stages[currentStage];


            progressFill.style.width =
                `${stage.progress}%`;

            simulationText.textContent =
                stage.text;


            activateStep(stage.step);


            currentStage++;


            setTimeout(
                nextStage,
                450
            );
        }


        nextStage();

    });
}





function resetSimulationSteps() {

    document
        .querySelectorAll(".sim-step")
        .forEach(step => {

            step.classList.remove("active");
            step.classList.remove("complete");

        });
}


function activateStep(stepId) {

    const steps = [
        "step1",
        "step2",
        "step3",
        "step4"
    ];

    const currentIndex =
        steps.indexOf(stepId);


    steps.forEach((id, index) => {

        const element =
            document.getElementById(id);


        if (index < currentIndex) {

            element.classList.remove("active");

            element.classList.add("complete");

        }


        if (index === currentIndex) {

            element.classList.add("active");

        }

    });
}




function closeSimulation() {

    progressFill.style.width = "100%";

    simulationText.textContent =
        "Prediction complete ✓";


    document
        .querySelectorAll(".sim-step")
        .forEach(step => {

            step.classList.remove("active");

            step.classList.add("complete");

        });


    setTimeout(() => {

        simulationOverlay.classList.remove(
            "active"
        );

    }, 350);
}




function updateGauge(score) {

    let normalized =
        (score - MIN_SCORE) /
        (MAX_SCORE - MIN_SCORE);


    normalized =
        Math.max(
            0,
            Math.min(
                1,
                normalized
            )
        );



    const dashOffset =
        GAUGE_LENGTH *
        (1 - normalized);


    gaugeProgress.style.strokeDashoffset =
        dashOffset;




    const angle =
        -90 +
        normalized * 180;


    gaugeNeedle.style.transform =
        `rotate(${angle}deg)`;

}




function animateScore(targetScore) {

    const duration = 1600;

    const startTime =
        performance.now();


    function animationFrame(currentTime) {

        const elapsed =
            currentTime - startTime;


        let progress =
            Math.min(
                elapsed / duration,
                1
            );



        const eased =
            1 - Math.pow(
                1 - progress,
                3
            );


        const currentScore =
            targetScore * eased;


        scoreValue.textContent =
            currentScore.toFixed(2);


        updateGauge(currentScore);


        if (progress < 1) {

            requestAnimationFrame(
                animationFrame
            );

        }

    }


    requestAnimationFrame(
        animationFrame
    );
}




async function getPrediction(data) {

    const response =
        await fetch(
            API_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(data)
            }
        );


    if (!response.ok) {

        let errorText =
            "Unable to generate prediction.";

        try {

            const errorData =
                await response.json();

            if (errorData.detail) {

                errorText =
                    typeof errorData.detail === "string"
                        ? errorData.detail
                        : JSON.stringify(
                            errorData.detail
                        );

            }

        } catch (_) {



        }


        throw new Error(errorText);
    }


    return await response.json();
}


form.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const data =
            getFormData();




        predictBtn.disabled = true;


        predictBtn.querySelector(
            ".btn-content"
        ).style.display = "none";


        predictBtn.querySelector(
            ".btn-loading"
        ).style.display = "block";



        const predictionPromise =
            getPrediction(data);




        const simulationPromise =
            runSimulation();


        try {



            const [
                result
            ] = await Promise.all([
                predictionPromise,
                simulationPromise
            ]);


            const score =
                Number(
                    result.predicted_mental_health_score
                );


            if (!Number.isFinite(score)) {

                throw new Error(
                    "The API returned an invalid prediction."
                );

            }


            closeSimulation();


            resultCard.classList.add(
                "active"
            );




            animateScore(score);




            setTimeout(() => {

                resultCard.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }, 400);


        } catch (error) {

            /*
               Hide simulation if API fails
            */

            simulationOverlay.classList.remove(
                "active"
            );


            showError(
                error.message ||
                "Something went wrong while generating the prediction."
            );

        } finally {

            predictBtn.disabled = false;


            predictBtn.querySelector(
                ".btn-content"
            ).style.display = "flex";


            predictBtn.querySelector(
                ".btn-loading"
            ).style.display = "none";

        }

    }
);


/* =========================================
   ERROR HANDLING
========================================= */

function showError(message) {

    errorMessage.textContent =
        message;

    errorToast.classList.add(
        "show"
    );


    setTimeout(() => {

        errorToast.classList.remove(
            "show"
        );

    }, 6000);
}


closeError.addEventListener(
    "click",
    () => {

        errorToast.classList.remove(
            "show"
        );

    }
);




againBtn.addEventListener(
    "click",
    () => {

        resultCard.classList.remove(
            "active"
        );


        scoreValue.textContent =
            "0.00";


        updateGauge(0);


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);




updateGauge(0);