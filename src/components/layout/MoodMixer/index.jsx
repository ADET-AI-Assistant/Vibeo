import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

const MOODS = [
    { id: 'exciting', label: 'Exciting', query: 'action exciting fast-paced' },
    { id: 'relaxing', label: 'Relaxing', query: 'relaxing peaceful calm' },
    { id: 'dark', label: 'Dark', query: 'dark gritty intense' },
    { id: 'romantic', label: 'Romantic', query: 'romantic love story' },
    { id: 'funny', label: 'Funny', query: 'funny comedy hilarious' },
    { id: 'scary', label: 'Scary', query: 'scary horror spooky' },
    { id: 'thought-provoking', label: 'Deep', query: 'thought-provoking deep philosophical' },
    { id: 'inspiring', label: 'Inspiring', query: 'inspiring emotional uplifting' },
];

const MoodMixer = () => {
    const navigate = useNavigate();

    const handleMoodClick = (mood) => {
        navigate(`/smart-search?q=${encodeURIComponent(mood.query)}`);
    };

    return (
        <section className="mood-mixer">
            <div className="mood-mixer__inner">
                <h3 className="mood-mixer__title">How are you feeling today?</h3>
                <div className="mood-chip-list">
                    {MOODS.map((mood) => (
                        <button
                            key={mood.id}
                            className="mood-chip"
                            onClick={() => handleMoodClick(mood)}
                        >
                            <span className="mood-chip__label">{mood.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default MoodMixer;
