import {
  Container,
  Flex,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  VStack,
  HStack,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Text,
  useToast,
  Spinner,
  Grid,
  Box,
  Tooltip,
  Switch,
  FormHelperText,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import OpenAI from 'openai';
import { useState, useRef, useEffect } from 'react';
import { saveAs } from 'file-saver';

export default function Home() {
  const [apiKeyInput, setApiKey] = useState('');
  const [model, setModel] = useState('tts-1');
  const [inputText, setInputText] = useState('');
  const [voice, setVoice] = useState('alloy');
  const [speed, setSpeed] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sliderValue, setSliderValue] = useState(1);
  const [showTooltip, setShowTooltip] = useState(false);
  const sliderRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const { colorMode, toggleColorMode } = useColorMode();

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const toast = useToast();

  const handleModelToggle = () => {
    setModel(model === 'tts-1' ? 'tts-1-hd' : 'tts-1');
  };

  const handleDownload = () => {
    saveAs(audioUrl, 'speech.mp3');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAudioUrl(null);
    try {
      const headers = new Headers();
      headers.append('Authorization', `Bearer ${apiKeyInput}`);
      headers.append('Content-Type', 'application/json');

      const body = JSON.stringify({
        model: model,
        input: inputText,
        voice: voice,
        speed: speed.toFixed(1),
      });

      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: headers,
        body: body,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      setAudioUrl(audioUrl);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'An error occurred',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.value.length <= 262144) {
      setInputText(e.target.value);
    }
  };

  const cardBg = useColorModeValue('white', 'gray.800');
  const cardShadow = useColorModeValue('lg', 'dark-lg');
  const inputBorderColor = useColorModeValue('gray.300', 'gray.600');
  const buttonBg = useColorModeValue('black', 'gray.700');
  const buttonColor = useColorModeValue('white', 'gray.100');
  const sliderTrackBg = useColorModeValue('gray.300', 'gray.600');
  const sliderFilledTrackBg = useColorModeValue('black', 'gray.400');

  return (
    <Container maxW="container.md" py={10}>
      <Flex direction="column" align="center" justify="center" minH="100vh" w="full">
        <Box
          bg={cardBg}
          borderRadius="lg"
          boxShadow={cardShadow}
          p={6}
          w="full"
          maxW="md"
        >
          <VStack spacing={6} as="form" onSubmit={handleSubmit} width="full" maxW="md">
            <Box
              bg={buttonBg}
              w="100%"
              p={5}
              borderTopRadius="md"
              boxShadow="lg"
            >
              <Heading textAlign="center" color={buttonColor}>
                Open-Audio TTS
              </Heading>
              <Text
                fontSize="xs"
                color={useColorModeValue('gray.400', 'gray.500')}
                textAlign="center"
                mt={2}
              >
                Powered by OpenAI TTS
              </Text>
              <Text
                fontSize="xs"
                color={useColorModeValue('gray.400', 'gray.500')}
                textAlign="center"
                mt={2}
                fontWeight={'700'}
              >
                <a
                  href="https://github.com/Justmalhar/open-audio"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: useColorModeValue('gray.400', 'gray.500') }}
                >
                  View on GitHub
                </a>
              </Text>
            </Box>

            <Grid templateColumns={{ md: '4fr 1fr' }} gap={4} width="full">
              <FormControl isRequired>
                <FormLabel htmlFor="api-key">
                  API Key
                  <br />
                  sk-x3UKCid6kJYa9FZp3rneT3B27lbkFJaf6aMp4odqXsdbNxxq8W
                </FormLabel>
                <Input
                  id="api-key"
                  placeholder="Enter your OpenAI API key"
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKey(e.target.value)}
                  variant="outline"
                  borderColor={inputBorderColor}
                />
              </FormControl>

              <FormControl>
                <VStack align="start" spacing={0}>
                  <FormLabel htmlFor="model">Quality</FormLabel>
                  <HStack align="center" h="100%" mx="0" mt="2">
                    <Switch
                      id="model"
                      colorScheme={colorMode === 'dark' ? 'gray' : 'blackAlpha'}
                      isChecked={model === 'tts-1-hd'}
                      onChange={handleModelToggle}
                      size="md"
                    />
                    <FormHelperText textAlign="center" mt={'-1'}>
                      {model === 'tts-1' ? 'High' : 'HD'}
                    </FormHelperText>
                  </HStack>
                </VStack>
              </FormControl>
            </Grid>

            <FormControl isRequired>
              <FormLabel htmlFor="input-text">Input Text</FormLabel>
              <Textarea
                id="input-text"
                placeholder="Enter the text you want to convert to speech"
                value={inputText}
                onChange={handleInputChange}
                resize="vertical"
                maxLength={262144}
                borderColor={inputBorderColor}
              />
              <Box textAlign="right" fontSize="sm">
                {inputText.length} / 262144
              </Box>
            </FormControl>

            <HStack width="full" justifyContent="space-between">
              <FormControl isRequired width="45%">
                <FormLabel htmlFor="voice">Voice</FormLabel>
                <Select
                  id="voice"
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  variant="outline"
                  placeholder="Select voice"
                  borderColor={inputBorderColor}
                  focusBorderColor={inputBorderColor}
                  colorScheme={colorMode === 'dark' ? 'gray' : 'blackAlpha'}
                  _hover={{ borderColor: useColorModeValue('gray.400', 'gray.600') }}
                >
                  <option value="onyx">Onyx</option>
                  <option value="alloy">Alloy</option>
                  <option value="echo">Echo</option>
                  <option value="fable">Fable</option>
                  <option value="nova">Nova</option>
                  <option value="shimmer">Shimmer</option>
                </Select>
              </FormControl>

              <FormControl width="40%" mt="-15">
                <FormLabel htmlFor="speed">Speed</FormLabel>
                <Slider
                  id="speed"
                  defaultValue={1}
                  min={0.25}
                  max={4}
                  step={0.25}
                  onChange={(v) => setSliderValue(v)}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  ref={sliderRef}
                  aria-label="slider-ex-1"
                >
                  <SliderTrack bg={sliderTrackBg}>
                    <SliderFilledTrack bg={sliderFilledTrackBg} />
                  </SliderTrack>
                  <Tooltip
                    hasArrow
                    bg="black"
                    color="white"
                    placement="bottom"
                    isOpen={showTooltip}
                    label={`${sliderValue.toFixed(2)}x`}
                  >
                    <SliderThumb />
                  </Tooltip>
                </Slider>
              </FormControl>
            </HStack>

            <Button
              size="lg"
              bg={buttonBg}
              color={buttonColor}
              colorScheme={colorMode === 'dark' ? 'gray' : 'blackAlpha'}
              borderColor={buttonBg}
              type="submit"
              isLoading={isSubmitting}
              loadingText="Generating..."
            >
              Create Speech
            </Button>

            {isSubmitting && (
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor={useColorModeValue('gray.200', 'gray.600')}
                color={buttonBg}
                size="md"
              />
            )}
            {audioUrl && (
              <>
                <audio controls src={audioUrl}>
                  Your browser does not support the audio element.
                </audio>
                <Button onClick={handleDownload}>Download MP3</Button>
              </>
            )}
          </VStack>
        </Box>
      </Flex>
    </Container>
  );
}
