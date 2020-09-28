import { getCustomRepository, getRepository } from 'typeorm';
import Category from '../models/Category';
import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    const { total } = await transactionRepository.getBalance();

    if(type === "outcome" && total < value){
      throw new AppError('You do not have enough balance');
    }

    /*verificar se a categoria existe buscar no banco de dados*/
    let transactionCategory = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    /*Não existe? criar nova categoria no banco de dados*/
    if(!transactionCategory){
      transactionCategory = await categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(transactionCategory);
    }

    const transaction = transactionRepository.create({
      title,
      type,
      value,
      category: transactionCategory,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
