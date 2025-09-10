import mongoose, { Schema, Document } from 'mongoose'

export interface IMatch extends Document {
  gameId: string
  player1Id: string
  player2Id: string
  player1Username: string
  player2Username: string
  player1Score: number
  player2Score: number
  winner: string | null
  questions: Array<{
    question: string
    answer: string
    options: string[]
    correctAnswer: string
    answeredBy: string | null
    answeredAt: Date | null
    responseTime: number
  }>
  status: 'completed' | 'abandoned'
  startTime: Date
  endTime: Date | null
  duration: number
  createdAt: Date
  updatedAt: Date
}

const MatchSchema: Schema = new Schema({
  gameId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  player1Id: {
    type: String,
    required: true,
    index: true
  },
  player2Id: {
    type: String,
    required: true,
    index: true
  },
  player1Username: {
    type: String,
    required: true
  },
  player2Username: {
    type: String,
    required: true
  },
  player1Score: {
    type: Number,
    required: true,
    default: 0
  },
  player2Score: {
    type: Number,
    required: true,
    default: 0
  },
  winner: {
    type: String,
    default: null
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      required: true
    },
    options: [{
      type: String,
      required: true
    }],
    correctAnswer: {
      type: String,
      required: true
    },
    answeredBy: {
      type: String,
      default: null
    },
    answeredAt: {
      type: Date,
      default: null
    },
    responseTime: {
      type: Number,
      default: 0
    }
  }],
  status: {
    type: String,
    enum: ['completed', 'abandoned'],
    default: 'completed'
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    default: null
  },
  duration: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

MatchSchema.index({ player1Id: 1, createdAt: -1 })
MatchSchema.index({ player2Id: 1, createdAt: -1 })
MatchSchema.index({ status: 1, createdAt: -1 })
MatchSchema.index({ winner: 1, createdAt: -1 })

export default mongoose.models.Match || mongoose.model<IMatch>('Match', MatchSchema)
