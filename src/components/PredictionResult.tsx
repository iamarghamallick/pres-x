import React from "react";

const PredictionResult = ({ predictionData }) => {
    const { prediction, graph_image, symptoms_chart, symptoms_reported } =
        predictionData;

    const renderImage = (base64String) => (
        <img
            src={`data:image/png;base64,${base64String}`}
            alt="Chart"
            className="w-full rounded shadow"
        />
    );

    return (
        <div className="space-y-6 mb-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800">Diagnosis Prediction</h2>

            {/* Primary Prediction */}
            <div className="p-4 bg-green-50 border-l-4 border-green-400 rounded">
                <p className="text-lg font-semibold text-green-700">
                    Most Likely: {prediction.primary_prediction.disease}
                </p>
                <p className="text-sm text-green-600">
                    Confidence: {(prediction.primary_prediction.confidence * 100).toFixed(2)}%
                </p>
            </div>

            {/* Alternative Predictions */}
            {prediction.alternative_predictions.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Other Possibilities:</h3>
                    <ul className="list-disc list-inside text-gray-600">
                        {prediction.alternative_predictions.map((alt, idx) => (
                            <li key={idx}>
                                {alt.disease} – {(alt.confidence * 100).toFixed(2)}%
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Symptoms Reported */}
            <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Symptoms Reported:</h3>
                <div className="flex flex-wrap gap-2">
                    {symptoms_reported.map((symptom, idx) => (
                        <span
                            key={idx}
                            className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                        >
                            {symptom.replace(/_/g, " ")}
                        </span>
                    ))}
                </div>
            </div>

            {/* Graph Images */}
            <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Prediction Confidence Graph</h4>
                    {renderImage(graph_image)}
                </div>
                <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Symptoms Chart</h4>
                    {renderImage(symptoms_chart)}
                </div>
            </div>
        </div>
    );
};

export default PredictionResult;
