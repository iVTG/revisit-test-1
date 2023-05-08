import { Button, Center, Flex, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useAppSelector, useCreatedStore } from '../store';
import { useStudyConfig } from '../store/hooks/useStudyConfig';

function download(graph: unknown, filename: string) {
  const dataStr =
    'data:text/json;charset=utf-8,' +
    encodeURIComponent(JSON.stringify(graph, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute('href', dataStr);
  downloadAnchorNode.setAttribute('download', filename);
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

export function StudyEnd() {
  const { trrack } = useCreatedStore();
  const config = useStudyConfig();
  const ids = useAppSelector((s) => s.study.studyIdentifiers);

  const autoDownload = config?.uiConfig.autoDownloadStudy || false;
  const autoDownloadDelay = autoDownload
    ? config?.uiConfig.autoDownloadTime || -1
    : -1;

  const [delayCounter, setDelayCounter] = useState(
    Math.floor(autoDownloadDelay / 1000)
  );

  useEffect(() => {
    if (delayCounter <= 0) return;

    const interval = setInterval(() => {
      setDelayCounter((c) => c - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [delayCounter]);

  if (!config || !ids) return null;

  const graph = trrack.graph.backend;
  const filename = `${config.studyMetadata.title}_${ids.pid}_${ids.session_id}.json`;

  if (delayCounter === 0) {
    download(graph, filename);
  }

  return (
    <Center style={{ height: '100%' }}>
      <Flex direction="column">
        <Center>
          <Text size="xl" display="block">
            {config.uiConfig.studyEndMsg
              ? config.uiConfig.studyEndMsg
              : 'Thank you for completing the study. You may close this window now.'}
          </Text>
        </Center>
        <Center>
          <div>
            <Button onClick={() => download(graph, filename)} display="block">
              Download Study
            </Button>
          </div>
        </Center>
        <Center>
          {autoDownload && (
            <Text size="lg">
              Study results will be downloaded in {delayCounter} seconds. If the
              download does not start automatically, click above to download.
            </Text>
          )}
        </Center>
      </Flex>
    </Center>
  );
}
