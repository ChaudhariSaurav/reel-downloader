import React, { useState } from "react";
import {
  MantineProvider,
  Box,
  TextInput,
  Button,
  Card,
  Text,
  Group,
  Select,
  Image,
  Alert,
  Loader,
  Grid,
  Flex,
  ScrollArea,
  ActionIcon,
} from "@mantine/core";
import axios from "axios";
import { LuCross, LuLink, LuXCircle } from "react-icons/lu";
import "@mantine/core/styles.css";

const Downloader = () => {
  const [url, setUrl] = useState("");
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState("");
  const [error, setError] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);

  const validateUrl = (url) => {
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return regex.test(url);
  };

  const formatTitle = (title) => {
    return title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // const handleFetchVideo = async () => {
  //   if (!validateUrl(url)) {
  //     setError("Please enter a valid YouTube URL");
  //     return;
  //   }

  //   setLoading(true);
  //   setError("");

  //   try {
  //     const response = await axios.get(
  //       `https://cdn51.savetube.me/info?url=${url}}`
  //     );

  //     if (response.data?.data) {
  //       setVideoData(response.data.data);
  //       setSelectedQuality("");
  //       setUrl("");

  //       // Add URL to search history if it's not already present
  //       setSearchHistory((prevHistory) => {
  //         const newHistory = [...prevHistory];
  //         if (!newHistory.includes(url)) {
  //           newHistory.push(url);
  //         }
  //         return newHistory;
  //       });
  //     } else {
  //       setError("No video formats found. Please check the URL.");
  //     }
  //   } catch (err) {
  //     setError("Failed to fetch video details. Please try again later.");
  //     console.error(err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleFetchVideo = async () => {
    if (!validateUrl(url)) {
      setError("Please enter a valid YouTube URL");
      return;
    }
  
    // Store the URL in UserUrl and log it
    let UserUrl = { url };
    console.log({"UserUrl": UserUrl}); // Log the UserUrl
  
    setLoading(true);
    setError("");
  
    try {
      const response = await axios.get(
        `https://cdn51.savetube.me/info?url=${url}`
      );
  
      if (response.data?.data) {
        setVideoData(response.data.data);
        setSelectedQuality("");
        setUrl("");
  
        // Add URL to search history if it's not already present
        setSearchHistory((prevHistory) => {
          const newHistory = [...prevHistory];
          if (!newHistory.includes(url)) {
            newHistory.push(url);
          }
          return newHistory;
        });
      } else {
        setError("No video formats found. Please check the URL.");
      }
    } catch (err) {
      setError("Failed to fetch video details. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownload = () => {
    if (!selectedQuality) {
      setError("Please select a download quality");
      return;
    }

 
  const extractYouTubeID = (UserUrl) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|watch)(?:[^\w-]|$)|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const matches = UserUrl.match(regex);

    console.log({UserUrl})
    return matches ? matches[1]  || matches[2] || matches[4] : null;
  };
  
  
  

    const videoId = extractYouTubeID(url);
    console.log({videoId})
    if (!videoId) {
      setError("Invalid video ID.");
      return;
    }

    const formattedTitle = formatTitle(videoData.title);
    const qualityMatch = selectedQuality.match(/-(\d+)\.savetube\.me\.mp4$/);
    const quality = qualityMatch ? qualityMatch[1] : "1080";
    const downloadUrl = `https://cdn53.savetube.me/media/${videoId}/${formattedTitle}-${quality}-ytshorts.savetube.me.mp4`;

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.target = "_blank";
    link.download = `${videoId}-${quality}-ytshorts.mp4`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatSelectData = () => {
    if (
      !videoData ||
      !videoData.video_formats ||
      videoData.video_formats.length === 0
    )
      return [];

    const uniqueFormats = new Set();

    return videoData.video_formats
      .filter((format) => format.url)
      .filter((format) => {
        const url = format.url;
        if (uniqueFormats.has(url)) {
          return false;
        }
        uniqueFormats.add(url);
        return true;
      })
      .map((format) => ({
        value: format.url,
        label: `${format.label || "Video"} (${format.quality}p)`,
      }));
  };

  const clearHistory = () => {
    setSearchHistory([]);
  };

  const renderError = () => (
    <Alert title="Error" color="red" mt="md">
      {error}
    </Alert>
  );

  const renderLoader = () => (
    <Flex align="center" justify="center" style={{ height: "100vh" }}>
      <Loader color="teal" size="lg" />
    </Flex>
  );

  const renderVideoCard = () => (
    <Card shadow="sm" padding="lg" mt="xl" withBorder>
      <Card.Section>
        <Image
          src={videoData.thumbnail}
          alt="Video thumbnail"
          height={160}
          fit="cover"
        />
      </Card.Section>

      <Group position="apart" mt="md" mb="xs">
        <Text weight={500}>
          {videoData.title} - {videoData.durationLabel}
        </Text>
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
        Get Download
      </Button>
    </Card>
  );

  return (
    <MantineProvider>
      <Box
        mx="auto"
        mt="xl"
        style={{ maxWidth: "480px", width: "100%", padding: 8 }}
      >
        <Grid>
          <Grid.Col mx="auto">
            <Group>
              <TextInput
                label="Enter YouTube URL"
                placeholder="https://youtube.com/..."
                value={url}
                onChange={(event) => setUrl(event.currentTarget.value)}
                style={{ width: "100%" }} // Use style if width prop isn't effective
                icon={<LuLink size={16} />}
                rightSection={
                  url && (
                    <ActionIcon onClick={() => setUrl("")} title="Clear input" style={{background:'transparent', color:'black'}}>
                      <LuXCircle size={16} />
                    </ActionIcon>
                  )
                }
              />
            </Group>
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

        <Box mt="lg">
          <Text weight={500}>Search History:</Text>
          <ScrollArea style={{ height: 100 }} mt="md">
            <Flex gap="md" direction="row" wrap="nowrap">
              {searchHistory.map((historyUrl, index) => (
                <Card
                  key={index}
                  shadow="sm"
                  withBorder
                  width={"100%"}
                  padding="md"
                >
                  <Text>{historyUrl}</Text>
                </Card>
              ))}
            </Flex>
          </ScrollArea>
          {searchHistory.length > 0 && (
            <Button mt="md" color="red" onClick={clearHistory}>
              Clear Search History
            </Button>
          )}
        </Box>
      </Box>
    </MantineProvider>
  );
};

export default Downloader;
