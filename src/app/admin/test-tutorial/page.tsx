'use client';

import React, { useState } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

export default function Tour() {
    const [run, setRun] = useState(false);
    const [steps] = useState<Step[]>([
        {
            target: '#step1',
            content: 'Click here to post a tweet!',
            placement: 'bottom',
        },
        {
            target: '#step2',
            content: 'Here’s your feed.',
            placement: 'top',
        },
    ]);

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status } = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            setRun(false); // Tour finished or skipped
        }
    };

    return (
        <div className="space-y-8 mt-32 flex flex-col items-center">
            <Joyride
                steps={steps}
                run={run}
                continuous
                scrollToFirstStep
                showProgress
                showSkipButton
                callback={handleJoyrideCallback}
                styles={{
                    options: {
                        zIndex: 10000,
                    },
                }}
            />

            <div id="step1" className="bg-[var(--background-dark2)] p-2">
                hola
            </div>
            <div id="step2" className="bg-[var(--background-dark2)] p-2">
                cómo
            </div>
            <div id="step3" className="bg-[var(--background-dark2)] p-2">
                estás
            </div>

            <button
                onClick={() => setRun(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded"
            >
                Start Tour
            </button>
        </div>
    );
}
