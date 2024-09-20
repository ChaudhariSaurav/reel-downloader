import React, { useState } from 'react';
import { MantineProvider, Box, TextInput, Button, Card, Text, Group, Select, Image, Alert, Loader } from '@mantine/core';
import axios from 'axios';
import { LuLink } from 'react-icons/lu';
import '@mantine/core/styles.css';

const YouTubeDownloader = () => {
  const [url, setUrl] = useState('');
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('');
  const [error, setError] = useState('');

  const validateUrl = () => {
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return regex.test(url);
  };

  const handleFetchVideo = async () => {
    if (!validateUrl()) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`https://cdn51.savetube.me/info?url=${encodeURIComponent(url)}`);

      if (response.status === 200) {
        const data = response.data;
        if (data && data.data) {
          setVideoData(data.data);
          setSelectedQuality('');
        } else {
          setError('No video formats found. Please check the URL.');
        }
      } else {
        setError('Unexpected response from the server.');
      }
    } catch (error) {
      setError('Failed to fetch video details. Please try again later.');
      console.error(error);
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
    if (!videoData || !videoData.formats) return [];
    return videoData.formats.map(format => ({
      value: format.url,
      label: `${format.quality} - ${format.extension}`
    }));
  };

  return (
    <MantineProvider>
      <Box maw={400} mx="auto" mt="xl">
        <TextInput
          label="Enter YouTube URL"
          placeholder="https://youtube.com/..."
          value={url}
          onChange={(event) => setUrl(event.currentTarget.value)}
          icon={<LuLink size={16} />}
        />
        <Button fullWidth mt="md" onClick={handleFetchVideo} loading={loading}>
          Fetch Video
        </Button>

        {error && (
          <Alert title="Error" color="red" mt="md">
            {error}
          </Alert>
        )}

        {loading && <Loader color="teal" size="lg" mt="md" />}

        {videoData && (
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
              nothingFound="No formats available"
            />

            <Button fullWidth mt="md" color="teal" onClick={handleDownload}>
              Get Download Link
            </Button>
          </Card>
        )}
      </Box>
    </MantineProvider>
  );
};

export default YouTubeDownloader;
