import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Grid } from '@mantine/core';
import { IconCircleCheck } from '@tabler/icons-react';
import { getHotkeyHandler } from '@mantine/hooks';
import { useLocation } from 'react-router-dom';
import { StimulusParams } from '../../../store/types';
import RankingCombinations from './ranking-combinations.json';

const CombinationsByArp: { [arp: string]: number[][] } = (
  RankingCombinations as { arp: number; rankings: number[] }[]
).reduce((a, v) => ({ ...a, [v.arp.toString()]: v.rankings }), {});

const Ranking = ({ rankings }: { rankings: number[] }) => {
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <div>
        {rankings.map((item, idx) => {
          return (
            <div
              key={idx}
              style={{
                textAlign: 'center',
                marginBottom: 1,
                padding: 2,
                background: `${item === 0 ? '#AEC7E8' : '#FF9896'}`,
              }}
            >
              {item === 0 ? 'Group A' : 'Group B'}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const FairnessJND = ({ parameters, setAnswer }: StimulusParams<any>) => {
  const id = useLocation().pathname;
  const [selectedArp, setSelectedArp] = useState(-1);

  const [r1, r2] = useMemo(() => {
    if (Math.floor(Math.random() * 2) === 0) {
      return [
        {
          arp: parameters.data.r1,
          ranking:
            CombinationsByArp[parameters.data.r1][
              Math.floor(
                Math.random() * CombinationsByArp[parameters.data.r1].length
              )
            ],
        },
        {
          arp: parameters.data.r2,
          ranking:
            CombinationsByArp[parameters.data.r2][
              Math.floor(
                Math.random() * CombinationsByArp[parameters.data.r2].length
              )
            ],
        },
      ];
    } else {
      return [
        {
          arp: parameters.data.r2,
          ranking:
            CombinationsByArp[parameters.data.r2][
              Math.floor(
                Math.random() * CombinationsByArp[parameters.data.r2].length
              )
            ],
        },
        {
          arp: parameters.data.r1,
          ranking:
            CombinationsByArp[parameters.data.r1][
              Math.floor(
                Math.random() * CombinationsByArp[parameters.data.r1].length
              )
            ],
        },
      ];
    }
  }, [parameters]);

  const updateAnswer = useCallback(
    (arp: number) => {
      setSelectedArp(arp);
      setAnswer({
        trialId: id,
        status: true,
        answers: {
          [`${id}/leftARP`]: r1.arp,
          [`${id}/rightARP`]: r2.arp,
          [`${id}/leftRanking`]: JSON.stringify(r1.ranking),
          [`${id}/rightRanking`]: JSON.stringify(r2.ranking),
          [`${id}/choice`]: r1.arp === arp ? 'left' : 'right',
          [`${id}/correctChoice`]: r1.arp < r2.arp ? 'left' : 'right',
        },
      });
    },
    [r1, r2, id, setAnswer]
  );

  useEffect(() => {
    const ev = getHotkeyHandler([
      ['ArrowLeft', () => updateAnswer(r1.arp)],
      ['ArrowRight', () => updateAnswer(r2.arp)],
    ]);

    document.body.addEventListener('keydown', ev);

    return () => {
      document.body.removeEventListener('keydown', ev);
    };
  }, [r1, r2, updateAnswer]);

  return (
    <div>
      <Grid>
        <Grid.Col span={2}>
          <Ranking rankings={r1.ranking} />

          <Button
            fullWidth
            disabled={r1.arp === selectedArp}
            onClick={() => {
              updateAnswer(r1.arp);
            }}
          >
            {r1.arp === selectedArp ? (
              <IconCircleCheck />
            ) : (
              'Select this ranking'
            )}
          </Button>
        </Grid.Col>
        <Grid.Col span={2}>
          <Ranking rankings={r2.ranking} />
          <Button
            fullWidth
            disabled={r2.arp === selectedArp}
            onClick={() => {
              updateAnswer(r2.arp);
            }}
          >
            {r2.arp === selectedArp ? (
              <IconCircleCheck />
            ) : (
              'Select this ranking'
            )}
          </Button>
        </Grid.Col>
      </Grid>
    </div>
  );
};

export default FairnessJND;
