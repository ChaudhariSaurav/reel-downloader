import React, { useState } from 'react';
import { MantineProvider, Box, TextInput, Button, Card, Text, Group, Select, Image, Alert, Loader, Grid, Flex  } from '@mantine/core';
import axios from 'axios';
import { LuLink } from 'react-icons/lu';
import '@mantine/core/styles.css';

const Downloader = () => {
  const [url, setUrl] = useState('');
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('');
  const [error, setError] = useState('');

  const validateUrl = (url) => {
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return regex.test(url);
  };

  const handleFetchVideo = async () => {
    if (!validateUrl(url)) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`https://cdn51.savetube.me/info?url=${encodeURIComponent(url)}`);

      if (response.data?.data) {
        setVideoData(response.data.data);
        setSelectedQuality('');
      } else {
        setError('No video formats found. Please check the URL.');
      }
    } catch (err) {
      setError('Failed to fetch video details. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!selectedQuality) {
      setError('Please select a download quality');
      return;
    }
    window.open(selectedQuality, '_blank');
  };

  const formatSelectData = () => {
    if (!videoData || !videoData.formats || videoData.formats.length === 0) return [];

    const uniqueFormats = new Map();

    videoData.formats.forEach((format) => {
      if (format.url) {
        uniqueFormats.set(format.url, `${format.label || format.quality} ${format.extension ? `(${format.extension})` : ''}`.trim());
      }
    });

    return Array.from(uniqueFormats, ([value, label]) => ({ value, label }));
  };

  const renderError = () => (
    <Alert title="Error" color="red" mt="md">
      {error}
    </Alert>
  );

  const renderLoader = () => (
	<Flex align="center" justify="center" style={{ height: '100vh' }}>
	  <Loader color="teal" size="lg" />
	</Flex>
  );

  const renderVideoCard = () => (
    <Card shadow="sm" padding="lg" mt="xl" withBorder>
      <Card.Section>
        <Image src={videoData.thumbnail} alt="Video thumbnail" height={160} fit="cover" />
      </Card.Section>

      <Group position="apart" mt="md" mb="xs">
        <Text weight={500}>{videoData.title}</Text>
      </Group>

      <Select
        label="Select Download Quality"
        placeholder="Choose quality"
        data={formatSelectData()}
        value={selectedQuality}
        onChange={setSelectedQuality}
        disabled={formatSelectData().length === 0}
      />

      <Button fullWidth mt="md" color="teal" onClick={handleDownload}>
        Get Download Link
      </Button>
    </Card>
  );

  return (
    <MantineProvider>
      <Box mx="auto" mt="xl" style={{ maxWidth: '480px', width: '100%' , padding:8}}>
        <Grid>
          <Grid.Col span={12}>
            <TextInput
              label="Enter YouTube URL"
              placeholder="https://youtube.com/..."
              value={url}
              onChange={(event) => setUrl(event.currentTarget.value)}
              icon={<LuLink size={16} />}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Button fullWidth mt="md" onClick={handleFetchVideo}>
              Fetch Video
            </Button>
          </Grid.Col>
        </Grid>

        {error && renderError()}
        {loading && renderLoader()}
        {videoData && renderVideoCard()}
      </Box>
    </MantineProvider>
  );
};

export default Downloader;
