
"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Logo from "./logo";
import type { GenerationState } from "@/app/learn/page";
import Image from "next/image";

const formSchema = z.object({
  topic: z.string().min(2, {
    message: "Topic must be at least 2 characters.",
  }),
  depth: z.enum(["15", "30"]),
});

type TopicFormValues = z.infer<typeof formSchema>;

interface TopicSelectionProps {
  onGenerateCourse: (topic: string, depth: 15 | 30) => Promise<void>;
  onStartGeneration: (
    topic: string, 
    depth: 15 | 30, 
    knowledgeLevel: 'beginner' | 'intermediate' | 'advanced',
    masteryGoal: 'basic' | 'proficient' | 'expert',
    difficulty: 'easy' | 'medium' | 'hard'
  ) => Promise<void>;
  generationState: GenerationState;
}

export default function TopicSelection({ onGenerateCourse, onStartGeneration, generationState }: TopicSelectionProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({
    knowledgeLevel: '' as 'beginner' | 'intermediate' | 'advanced' | '',
    masteryGoal: '' as 'basic' | 'proficient' | 'expert' | '',
    difficulty: '' as 'easy' | 'medium' | 'hard' | ''
  });
  const [topicData, setTopicData] = useState({ topic: '', depth: 15 as 15 | 30 });

  const form = useForm<TopicFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      depth: "15",
    },
  });
  
  const isGenerating = generationState.status === 'generating';
  const showQuestions = generationState.status === 'questions';

  const onSubmit = (values: TopicFormValues) => {
    setTopicData({ topic: values.topic, depth: parseInt(values.depth) as 15 | 30 });
    onGenerateCourse(values.topic, parseInt(values.depth) as 15 | 30);
  };

  const questions = [
    {
      title: "How well do you know this topic?",
      subtitle: "This helps us adjust the starting complexity",
      options: [
        { value: 'beginner', label: 'Complete Beginner', description: 'I\'m new to this topic' },
        { value: 'intermediate', label: 'Some Experience', description: 'I have basic knowledge' },
        { value: 'advanced', label: 'Quite Experienced', description: 'I know the fundamentals well' }
      ],
      key: 'knowledgeLevel' as keyof typeof answers
    },
    {
      title: "How well do you want to master it?",
      subtitle: "This determines the depth and practical focus",
      options: [
        { value: 'basic', label: 'Basic Understanding', description: 'Learn the core concepts' },
        { value: 'proficient', label: 'Practical Proficiency', description: 'Apply it in real situations' },
        { value: 'expert', label: 'Expert Level', description: 'Master advanced techniques' }
      ],
      key: 'masteryGoal' as keyof typeof answers
    },
    {
      title: "What difficulty level do you prefer?",
      subtitle: "This controls the complexity of examples and explanations",
      options: [
        { value: 'easy', label: 'Easy & Clear', description: 'Simple examples, step-by-step' },
        { value: 'medium', label: 'Balanced', description: 'Mix of theory and practice' },
        { value: 'hard', label: 'Challenging', description: 'Complex examples, advanced concepts' }
      ],
      key: 'difficulty' as keyof typeof answers
    }
  ];

  const handleAnswerSelect = (value: string) => {
    const currentQ = questions[currentQuestion];
    setAnswers(prev => ({ ...prev, [currentQ.key]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Start generation with all answers
      onStartGeneration(
        topicData.topic,
        topicData.depth,
        answers.knowledgeLevel,
        answers.masteryGoal,
        answers.difficulty
      );
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    } else {
      // Go back to topic selection
      setCurrentQuestion(0);
      setAnswers({ knowledgeLevel: '', masteryGoal: '', difficulty: '' });
      onGenerateCourse('', 15); // Reset to idle state
    }
  };

  const currentQ = questions[currentQuestion];
  const currentAnswer = answers[currentQ?.key];
  const canProceed = currentAnswer !== '';

  return (
    <div className="w-full max-w-lg">
       <div className="flex justify-center mb-8">
         <Logo />
       </div>
      <Card className="shadow-2xl shadow-primary/10">
        <CardContent>
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center space-y-4 pt-8">
              <Image
                src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMXk4OGxrMHU0MGtuYjEyb2Z3MWNmZDR0Zjg5NGZ5bTh5NTRrNWxsaSZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/oz45ELYgMoYVsZqmor/giphy.gif"
                width={150}
                height={150}
                alt="AI cat working hard"
                unoptimized={true}
                className="rounded-lg"
              />
              <div className="w-full max-w-md space-y-3">
                <Progress value={generationState.progress || 0} className="w-full" />
                <div className="text-center space-y-1">
                  <p className="text-muted-foreground font-medium">{generationState.currentStep}</p>
                  <p className="text-sm text-muted-foreground">{Math.round(generationState.progress || 0)}% complete</p>
                </div>
              </div>
            </div>
          ) : showQuestions ? (
            <div className="space-y-6 pt-4">
              <div className="text-center space-y-2">
                <div className="flex justify-center space-x-2 mb-4">
                  {questions.map((_, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full ${
                        index === currentQuestion
                          ? 'bg-primary'
                          : index < currentQuestion
                          ? 'bg-primary/60'
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <CardTitle className="font-headline text-2xl">{currentQ.title}</CardTitle>
                <CardDescription>{currentQ.subtitle}</CardDescription>
              </div>
              
              <RadioGroup value={currentAnswer} onValueChange={handleAnswerSelect}>
                <div className="space-y-3">
                  {currentQ.options.map((option) => (
                    <div key={option.value} className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor={option.value} className="font-medium cursor-pointer">
                          {option.label}
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>
              
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBack}>
                  {currentQuestion === 0 ? 'Back to Topic' : 'Previous'}
                </Button>
                <Button onClick={handleNext} disabled={!canProceed}>
                  {currentQuestion === questions.length - 1 ? 'Generate Course' : 'Next'}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <CardHeader className="text-center pb-4">
                <CardTitle className="font-headline text-3xl">What do you want to master today?</CardTitle>
                <CardDescription>Enter a topic and select the depth of your learning path.</CardDescription>
              </CardHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Topic</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., React, Python, Music Theory" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="depth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Learning Depth</FormLabel>
                        <FormControl>
                           <Tabs value={field.value} onValueChange={field.onChange} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="15">Overview</TabsTrigger>
                              <TabsTrigger value="30">Deep Dive</TabsTrigger>
                            </TabsList>
                          </Tabs>
                        </FormControl>
                         <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isGenerating} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                      Continue
                  </Button>
                </form>
              </Form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
