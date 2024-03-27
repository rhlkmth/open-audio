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
import OpenAI from "openai";
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
  const bgColor = useColorModeValue('gray.100', 'gray.900');
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const buttonBgColor = useColorModeValue('black', 'white');
  const buttonTextColor = useColorModeValue('white', 'black');

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
      headers.append("Authorization", `Bearer ${apiKeyInput}`);
      headers.append("Content-Type", "application/json");

      const body = JSON.stringify({
        model: model,
        input: inputText,
        voice: voice,
        speed: speed.toFixed(1)
      });

      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: headers,
        body: body,
      });

      console.log(response);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      setAudioUrl(audioUrl);

    } catch (error) {
      console.error("Error:", error);
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

  return (
    <Container bg={bgColor} maxW="container.lg" minH="100vh">
      <Flex direction="column" align="center" justify="center" py={8}>
        <Box
          bg={cardBgColor}
          borderRadius="lg"
          boxShadow="lg"
          p={6}
          w="full"
          maxW="md"
        >
          <VStack spacing={6} as="form" onSubmit={handleSubmit} width="full">
            <Box bg={buttonBgColor} w="100%" p={5} borderTopRadius="md" boxShadow="lg">
              <Heading textAlign="center" color={buttonTextColor}>Open-Audio TTS</Heading>
              <Text fontSize="xs" color="gray.400" textAlign="center" mt={2}>Powered by OpenAI TTS</Text>
              <Text fontSize="xs" color="gray.400" textAlign="center" mt={2} fontWeight="700">
                <a href="https://github.com/Justmalhar/open-audio" target="_blank" rel="noopener noreferrer" style={{ color: 'gray.400' }}>
                  View on GitHub
                </a>
              </Text>
            </Box>

            <Grid templateColumns={{ md: '4fr 1fr' }} gap={4} width="full">
              <FormControl isRequired>
                <FormLabel htmlFor="api-key" color={textColor}>
                  API Key
                </FormLabel>
                <Input
                  id="api-key"
                  placeholder="Enter your OpenAI API key"
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKey(e.target.value)}
                  variant="filled"
                  bg={cardBgColor}
                  borderColor={buttonBgColor}
                  color={textColor}
                  _hover={{ borderColor: 'gray.600' }}
                  _focus={{ borderColor: buttonBgColor }}
                />
              </FormControl>

              <FormControl>
                <VStack align="start" spacing={0}>
                  <FormLabel htmlFor="model" color={textColor}>
                    Quality
                  </FormLabel>
                  <HStack align="center" h="100%" mx="0" mt="2">
                    <Switch
                      id="model"
                      colorScheme={buttonBgColor === 'black' ? 'blackAlpha' : 'gray'}
                        isChecked={model === 'tts-1-hd'}
                      onChange={handleModelToggle}
                      size="md"
                    />
                    <FormHelperText mt={0} color={textColor}>
                      {model === 'tts-1' ? 'High' : 'HD'}
                    </FormHelperText>
                  </HStack>
                </VStack>
              </FormControl>
            </Grid>

            <FormControl isRequired>
              <FormLabel htmlFor="input-text" color={textColor}>
                Input Text
              </FormLabel>
              <Textarea
                id="input-text"
                placeholder="Enter the text you want to convert to speech"
                value={inputText}
                onChange={handleInputChange}
                resize="vertical"
                maxLength={262144}
                borderColor={buttonBgColor}
                color={textColor}
                bg={cardBgColor}
                _hover={{ borderColor: 'gray.600' }}
                _focus={{ borderColor: buttonBgColor }}
              />
              <Box textAlign="right" fontSize="sm" color={textColor}>
                {inputText.length} / 262144
              </Box>
            </FormControl>

            <HStack width="full" justifyContent="space-between">
              <FormControl isRequired width="45%">
                <FormLabel htmlFor="voice" color={textColor}>
                  Voice
                </FormLabel>
                <Select
                  id="voice"
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  variant="filled"
                  placeholder="Select voice"
                  borderColor={buttonBgColor}
                  focusBorderColor={buttonBgColor}
                  bg={cardBgColor}
                  color={textColor}
                  _hover={{ borderColor: 'gray.600' }}
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
                <FormLabel htmlFor="speed" color={textColor}>
                  Speed
                </FormLabel>
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
                  <SliderTrack bg="gray.300">
                    <SliderFilledTrack bg={buttonBgColor} />
                  </SliderTrack>
                  <Tooltip
                    hasArrow
                    bg={buttonBgColor}
                    color={buttonTextColor}
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
              bg={buttonBgColor}
              color={buttonTextColor}
              colorScheme={buttonBgColor === 'black' ? 'blackAlpha' : 'gray'}
              borderColor={buttonBgColor}
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
                emptyColor="gray.200"
                color={buttonBgColor}
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
